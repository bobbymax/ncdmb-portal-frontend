/**
 * Network Status Hook
 * Detects online/offline status and monitors connection quality
 */

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";

interface NetworkStatus {
  isOnline: boolean;
  wasOffline: boolean;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
}

export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    wasOffline: false,
  });

  const updateNetworkStatus = useCallback(() => {
    const isOnline = navigator.onLine;

    // Get connection info if available
    const connection =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection;

    setNetworkStatus((prev) => ({
      isOnline,
      wasOffline: prev.isOnline === false && isOnline === true,
      effectiveType: connection?.effectiveType,
      downlink: connection?.downlink,
      rtt: connection?.rtt,
    }));

    return isOnline;
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      const isOnline = updateNetworkStatus();
      if (isOnline) {
        toast.success("Connection restored", {
          autoClose: 2000,
          position: "bottom-right",
        });
      }
    };

    const handleOffline = () => {
      updateNetworkStatus();
      toast.error("No internet connection", {
        autoClose: false,
        position: "bottom-right",
        closeButton: true,
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Check connection quality changes
    const connection =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection;

    if (connection) {
      connection.addEventListener("change", updateNetworkStatus);
    }

    // Initial check
    updateNetworkStatus();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (connection) {
        connection.removeEventListener("change", updateNetworkStatus);
      }
    };
  }, [updateNetworkStatus]);

  return networkStatus;
};
