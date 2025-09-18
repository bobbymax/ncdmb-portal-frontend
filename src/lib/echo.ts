import Echo from "laravel-echo";
import Pusher from "pusher-js";
import TokenProvider from "./TokenProvider";

declare global {
  interface Window {
    Pusher: typeof Pusher;
  }
}

window.Pusher = Pusher;

// Create Echo instance with dynamic token support
const createEchoInstance = () => {
  return new Echo({
    broadcaster: "pusher",
    key: (import.meta as any).env.VITE_REVERB_APP_KEY,
    wsHost:
      (import.meta as any).env.VITE_REVERB_HOST ?? window.location.hostname,
    wsPort: Number((import.meta as any).env.VITE_REVERB_PORT ?? 8080),
    wssPort: Number((import.meta as any).env.VITE_REVERB_PORT ?? 8080),
    forceTLS: false, // true if you terminate TLS and expose wss
    enabledTransports: ["ws", "wss"],
    authEndpoint: "/broadcasting/auth",
    auth: {
      headers: {
        Authorization: `Bearer ${TokenProvider.getInstance().getToken() ?? ""}`,
        "X-Requested-With": "XMLHttpRequest",
      },
    },
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
