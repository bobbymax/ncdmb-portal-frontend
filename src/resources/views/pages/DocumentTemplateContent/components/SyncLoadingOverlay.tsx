import React from "react";

interface SyncLoadingOverlayProps {
  isSyncing: boolean;
}

const SyncLoadingOverlay: React.FC<SyncLoadingOverlayProps> = ({
  isSyncing,
}) => {
  if (!isSyncing) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div
          className="skeleton-line"
          style={{
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            animation: "skeleton-loading 1s infinite",
          }}
        ></div>
        <span>Syncing document data...</span>
      </div>
    </div>
  );
};

export default SyncLoadingOverlay;
