import Pusher, { Channel } from "pusher-js";
import TokenProvider from "./TokenProvider";
import { ApiService } from "../app/Services/ApiService";

// Enable pusher logging - don't include this in production
Pusher.logToConsole = process.env.NODE_ENV === "development";

// Connection state enum
export enum PusherConnectionState {
  CONNECTING = "connecting",
  CONNECTED = "connected",
  DISCONNECTED = "disconnected",
  FAILED = "failed",
}

// Pusher service class for centralized connection management
class PusherService {
  private pusher: Pusher | null = null;
  private channels: Map<string, Channel> = new Map();
  private connectionState: PusherConnectionState =
    PusherConnectionState.DISCONNECTED;
  private connectionStateListeners: Set<
    (state: PusherConnectionState) => void
  > = new Set();
  private tokenProvider: TokenProvider;

  constructor() {
    this.tokenProvider = TokenProvider.getInstance();
    this.setupTokenRefreshListener();
    // Initialize Pusher lazily when first needed
  }

  private initializePusher() {
    try {
      // Try multiple ways to get environment variables
      // For Create React App, use REACT_APP_ prefix
      const reverbKey =
        process.env.REACT_APP_VITE_REVERB_APP_KEY ||
        process.env.VITE_REVERB_APP_KEY ||
        (window as any).__REVERB_APP_KEY__;

      const reverbHost =
        process.env.REACT_APP_VITE_REVERB_HOST ||
        process.env.VITE_REVERB_HOST ||
        (window as any).__REVERB_HOST__ ||
        "localhost";

      const reverbPort =
        process.env.REACT_APP_VITE_REVERB_PORT ||
        process.env.VITE_REVERB_PORT ||
        (window as any).__REVERB_PORT__ ||
        "8080";

      const reverbScheme =
        process.env.REACT_APP_VITE_REVERB_SCHEME ||
        process.env.VITE_REVERB_SCHEME ||
        "http";

      // Debug logging removed for production

      if (!reverbKey) {
        // REVERB_APP_KEY not found in environment
        this.connectionState = PusherConnectionState.FAILED;
        this.notifyConnectionStateListeners();
        return;
      }

      this.pusher = new Pusher(reverbKey, {
        wsHost: reverbHost || "localhost",
        wsPort: parseInt(reverbPort) || 8080,
        wssPort: parseInt(reverbPort) || 8080,
        forceTLS: reverbScheme === "https",
        enabledTransports: ["ws", "wss"],
        cluster: "",
        authEndpoint: "/broadcasting/auth",
        auth: {
          headers: {
            Authorization: `Bearer ${this.tokenProvider.getToken() ?? ""}`,
            "X-Requested-With": "XMLHttpRequest",
          },
        },
        // Custom authorizer for dynamic token refresh
        authorizer: (channel: any, options: any) => ({
          authorize: (
            socketId: string,
            callback: (error: Error | null, data?: any) => void
          ) => {
            const token = this.tokenProvider.getToken();
            const apiService = new ApiService();

            apiService
              .request({
                method: "POST",
                url: "broadcasting/auth",
                headers: {
                  Authorization: `Bearer ${token ?? ""}`,
                  "X-Requested-With": "XMLHttpRequest",
                },
                data: {
                  socket_id: socketId,
                  channel_name: channel.name,
                },
              })
              .then((response) => callback(null, response.data))
              .catch((error) => {
                // Pusher authentication failed
                callback(
                  error instanceof Error ? error : new Error(String(error))
                );
              });
          },
        }),
      });

      // Set up connection state listeners
      this.setupConnectionStateListeners();

      this.connectionState = PusherConnectionState.CONNECTING;
      this.notifyConnectionStateListeners();
    } catch (error) {
      // Failed to initialize Pusher
      this.connectionState = PusherConnectionState.FAILED;
      this.notifyConnectionStateListeners();
    }
  }

  private setupConnectionStateListeners() {
    if (!this.pusher) return;

    this.pusher.connection.bind("connecting", () => {
      this.connectionState = PusherConnectionState.CONNECTING;
      this.notifyConnectionStateListeners();
    });

    this.pusher.connection.bind("connected", () => {
      this.connectionState = PusherConnectionState.CONNECTED;
      this.notifyConnectionStateListeners();
    });

    this.pusher.connection.bind("disconnected", () => {
      this.connectionState = PusherConnectionState.DISCONNECTED;
      this.notifyConnectionStateListeners();
    });

    this.pusher.connection.bind("error", (error: any) => {
      // Pusher connection error
      this.connectionState = PusherConnectionState.FAILED;
      this.notifyConnectionStateListeners();
    });
  }

  private setupTokenRefreshListener() {
    this.tokenProvider.subscribe((token) => {
      if (token && this.connectionState === PusherConnectionState.FAILED) {
        // Reinitialize Pusher with new token
        this.disconnect();
        this.initializePusher();
      }
    });
  }

  private notifyConnectionStateListeners() {
    this.connectionStateListeners.forEach((listener) => {
      try {
        listener(this.connectionState);
      } catch (error) {
        // Error in connection state listener
      }
    });
  }

  // Subscribe to connection state changes
  subscribeToConnectionState(listener: (state: PusherConnectionState) => void) {
    this.connectionStateListeners.add(listener);
    // Immediately call with current state
    listener(this.connectionState);

    // Return unsubscribe function
    return () => {
      this.connectionStateListeners.delete(listener);
    };
  }

  // Get current connection state
  getConnectionState(): PusherConnectionState {
    return this.connectionState;
  }

  // Ensure Pusher is initialized
  private ensureInitialized(): boolean {
    if (!this.pusher && this.connectionState !== PusherConnectionState.FAILED) {
      this.initializePusher();
    }
    return this.pusher !== null;
  }

  // Subscribe to a private channel
  subscribeToPrivateChannel(channelName: string): Channel | null {
    if (!this.ensureInitialized()) {
      // Pusher not initialized - check environment variables
      return null;
    }

    try {
      // Remove 'private-' prefix for Pusher.js
      const cleanChannelName = channelName.replace(/^private-/, "");
      const channel = this.pusher!.subscribe(cleanChannelName);
      this.channels.set(channelName, channel);
      return channel;
    } catch (error) {
      // Failed to subscribe to channel
      return null;
    }
  }

  // Unsubscribe from a channel
  unsubscribeFromChannel(channelName: string) {
    if (!this.ensureInitialized()) return;

    try {
      // Remove 'private-' prefix for Pusher.js
      const cleanChannelName = channelName.replace(/^private-/, "");
      this.pusher!.unsubscribe(cleanChannelName);
      this.channels.delete(channelName);
    } catch (error) {
      // Failed to unsubscribe from channel
    }
  }

  // Get a channel if already subscribed
  getChannel(channelName: string): Channel | null {
    return this.channels.get(channelName) || null;
  }

  // Disconnect from Pusher
  disconnect() {
    if (this.pusher) {
      this.pusher.disconnect();
      this.pusher = null;
    }
    this.channels.clear();
    this.connectionState = PusherConnectionState.DISCONNECTED;
    this.notifyConnectionStateListeners();
  }

  // Reconnect to Pusher
  reconnect() {
    this.disconnect();
    this.connectionState = PusherConnectionState.DISCONNECTED;
    this.initializePusher();
  }

  // Manually initialize Pusher (useful for debugging)
  initialize() {
    if (!this.pusher) {
      this.initializePusher();
    }
  }

  // Check if Pusher is available
  isAvailable(): boolean {
    return (
      this.pusher !== null &&
      this.connectionState === PusherConnectionState.CONNECTED
    );
  }
}

// Create singleton instance
const pusherService = new PusherService();

// Export both the service and a default pusher instance for backward compatibility
export default pusherService;
export { PusherService };
