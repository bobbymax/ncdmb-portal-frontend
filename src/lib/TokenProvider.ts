import { ApiService } from "../app/Services/ApiService";

/**
 * Centralized Token Provider for WebSocket Authentication
 * Manages chat-specific authentication tokens for Laravel Echo and real-time features
 */
class TokenProvider {
  private static instance: TokenProvider;
  private currentToken: string | null = null;
  private tokenExpiry: number | null = null;
  private listeners: ((token: string | null) => void)[] = [];
  private apiService: ApiService;

  private constructor() {
    // Initialize with token from localStorage if available
    this.currentToken = localStorage.getItem("chat_token");
    const expiry = localStorage.getItem("chat_token_expiry");
    this.tokenExpiry = expiry ? parseInt(expiry) : null;

    // Initialize API service for proper request handling
    this.apiService = new ApiService();
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
   * This method uses your existing API service with identity markers and request queue
   * @returns Promise<string | null> - The new token or null if failed
   */
  async fetchChatToken(): Promise<string | null> {
    try {
      const response = await this.apiService.get<{
        token: string;
        expires_in: number;
        user: {
          id: number;
          name: string;
          email: string;
        };
      }>("chat-token");

      if (response.data && response.data.token) {
        this.setToken(response.data.token, response.data.expires_in);
        return response.data.token;
      }
      return null;
    } catch (error: any) {
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

  /**
   * Check if token is expiring soon (within threshold)
   * @param thresholdMinutes - Minutes before expiry to consider "soon"
   * @returns True if token expires within threshold
   */
  isTokenExpiringSoon(thresholdMinutes: number = 5): boolean {
    if (!this.tokenExpiry) return false;
    const threshold = thresholdMinutes * 60 * 1000;
    return Date.now() > this.tokenExpiry - threshold;
  }

  /**
   * Get a valid token, refreshing if needed
   * @returns Promise<string | null> - Valid token or null
   */
  async getValidToken(): Promise<string | null> {
    if (this.isTokenExpiringSoon()) {
      // Token is expiring soon, try to refresh
      return await this.fetchChatToken();
    }
    return this.currentToken;
  }
}

export default TokenProvider;
