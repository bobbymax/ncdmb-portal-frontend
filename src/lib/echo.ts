import Echo from "laravel-echo";
import Pusher from "pusher-js";
import TokenProvider from "./TokenProvider";
import { ApiService } from "../app/Services/ApiService";

declare global {
  interface Window {
    Pusher: typeof Pusher;
  }
}

// window.Pusher = Pusher;

// Create Echo instance with dynamic token support
const createEchoInstance = () => {
  // Check if environment variables are available
  // Using process.env for better TypeScript compatibility
  const reverbKey =
    process.env.REACT_APP_VITE_REVERB_APP_KEY ||
    (window as any).__REVERB_APP_KEY__;
  const reverbHost =
    process.env.REACT_APP_VITE_REVERB_HOST ||
    (window as any).__REVERB_HOST__ ||
    window.location.hostname;
  const reverbPort = Number(
    process.env.REACT_APP_VITE_REVERB_PORT ||
      (window as any).__REVERB_PORT__ ||
      8080
  );

  // If no Reverb key is provided, create a mock Echo instance
  if (!reverbKey) {
    return {
      private: () => ({
        listen: () => {},
        stopListening: () => {},
      }),
      disconnect: () => {},
      leaveChannel: () => {},
    } as any;
  }

  return new Echo({
    broadcaster: "pusher",
    key: reverbKey,
    wsHost: reverbHost,
    wsPort: reverbPort,
    wssPort: reverbPort,
    forceTLS: false, // true if you terminate TLS and expose wss
    enabledTransports: ["ws", "wss"],
    authEndpoint: "/broadcasting/auth",
    auth: {
      headers: {
        Authorization: `Bearer ${TokenProvider.getInstance().getToken() ?? ""}`,
        "X-Requested-With": "XMLHttpRequest",
      },
    },
    // Dynamic authentication function that gets fresh token for each auth request
    authorizer: (channel: any, options: any) => {
      return {
        authorize: (
          socketId: string,
          callback: (error: Error | null, data?: any) => void
        ) => {
          const token = TokenProvider.getInstance().getToken();

          // Use ApiService to ensure identity markers are included
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
            .catch((error) =>
              callback(
                error instanceof Error ? error : new Error(String(error))
              )
            );
        },
      };
    },
    withCredentials: true,
  });
};

// Export the Echo instance
export const echo = createEchoInstance();

// Function to recreate Echo instance with fresh token
export const refreshEchoAuth = () => {
  // Disconnect current instance
  echo.disconnect();

  // Create new instance with fresh token
  const newEcho = createEchoInstance();

  // Update the exported echo reference
  Object.assign(echo, newEcho);

  return echo;
};

// Set up automatic token refresh when TokenProvider token changes
TokenProvider.getInstance().subscribe((token) => {
  if (token) {
    refreshEchoAuth();
  }
});
