/**
 * Centralized Token Provider for WebSocket Authentication
 * Manages chat-specific authentication tokens for Laravel Echo and real-time features
 */
class TokenProvider {
  private static instance: TokenProvider;
  private currentToken: string | null = null;
  private tokenExpiry: number | null = null;
  private listeners: ((token: string | null) => void)[] = [];

  private constructor() {
    // Initialize with token from localStorage if available
    this.currentToken = localStorage.getItem("chat_token");
    const expiry = localStorage.getItem("chat_token_expiry");
    this.tokenExpiry = expiry ? parseInt(expiry) : null;
  }

  static getInstance(): TokenProvider {
    if (!TokenProvider.instance) {
      TokenProvider.instance = new TokenProvider();
    }
    return TokenProvider.instance;
  }

  /**
   * Set the current authentication token with expiry
   * @param token - The authentication token
   * @param expiresIn - Token expiry time in seconds from now
   */
  setToken(token: string | null, expiresIn?: number): void {
    this.currentToken = token;

    // Calculate expiry time
    if (token && expiresIn) {
      this.tokenExpiry = Date.now() + expiresIn * 1000;
    } else if (token) {
      // Default 1 hour expiry if not specified
      this.tokenExpiry = Date.now() + 3600 * 1000;
    } else {
      this.tokenExpiry = null;
    }

    // Update localStorage for persistence
    if (token) {
      localStorage.setItem("chat_token", token);
      if (this.tokenExpiry) {
        localStorage.setItem("chat_token_expiry", this.tokenExpiry.toString());
      }
    } else {
      localStorage.removeItem("chat_token");
      localStorage.removeItem("chat_token_expiry");
    }

    // Notify all listeners
    this.listeners.forEach((listener) => listener(token));
  }

  /**
   * Get the current authentication token
   * @returns The current token or null
   */
  getToken(): string | null {
    return this.currentToken;
  }

  /**
   * Subscribe to token changes
   * @param listener - Callback function to be called when token changes
   * @returns Unsubscribe function
   */
  subscribe(listener: (token: string | null) => void): () => void {
    this.listeners.push(listener);

    // Call listener immediately with current token
    listener(this.currentToken);

    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Clear the current token and notify listeners
   */
  clearToken(): void {
    this.setToken(null);
  }

  /**
   * Check if a token is currently available and valid
   * @returns True if token exists and hasn't expired, false otherwise
   */
  hasToken(): boolean {
    return !!this.currentToken && this.isTokenValid();
  }

  /**
   * Check if the current token is valid (not expired)
   * @returns True if token exists and hasn't expired, false otherwise
   */
  isTokenValid(): boolean {
    if (!this.currentToken || !this.tokenExpiry) {
      return false;
    }
    return Date.now() < this.tokenExpiry;
  }

  /**
   * Fetch a new chat token from the server
   * This method uses session-based authentication to get a chat token
   * @returns Promise<string | null> - The new token or null if failed
   */
  async fetchChatToken(): Promise<string | null> {
    try {
      const response = await fetch("/api/chat-token", {
        method: "GET",
        credentials: "include", // Include session cookies
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.error("Failed to fetch chat token:", response.statusText);
        return null;
      }

      const data = await response.json();

      if (data.token) {
        this.setToken(data.token, data.expires_in);
        return data.token;
      }

      return null;
    } catch (error) {
      console.error("Error fetching chat token:", error);
      return null;
    }
  }

  /**
   * Get token expiry time in milliseconds
   * @returns Expiry timestamp or null
   */
  getTokenExpiry(): number | null {
    return this.tokenExpiry;
  }

  /**
   * Get time until token expires in seconds
   * @returns Seconds until expiry or 0 if expired/invalid
   */
  getTimeUntilExpiry(): number {
    if (!this.tokenExpiry) return 0;
    const timeLeft = Math.floor((this.tokenExpiry - Date.now()) / 1000);
    return Math.max(0, timeLeft);
  }
}

export default TokenProvider;
