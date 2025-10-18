import React from "react";
import logo from "../../../../assets/images/logo.png";

interface DocumentLoadingScreenProps {
  isMounted: boolean;
  isDataReady: boolean;
  isSyncing: boolean;
  mode: "store" | "update";
}

const DocumentLoadingScreen: React.FC<DocumentLoadingScreenProps> = ({
  isMounted,
  isDataReady,
  isSyncing,
  mode,
}) => {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(255, 255, 255, 0.98)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9998,
        animation: "fadeIn 0.3s ease",
      }}
    >
      <div style={{ textAlign: "center" }}>
        {/* Animated Logo */}
        <div
          style={{
            width: "100px",
            height: "100px",
            margin: "0 auto 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "pulse 2s infinite",
          }}
        >
          <img
            src={logo}
            alt="Logo"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        </div>

        {/* Loading Spinner */}
        <div
          className="spinner-border text-success mb-3"
          role="status"
          style={{ width: "48px", height: "48px" }}
        >
          <span className="visually-hidden">Loading...</span>
        </div>

        {/* Loading Message */}
        <h5
          style={{
            fontSize: "1.2rem",
            fontWeight: "600",
            color: "#1f2937",
            marginBottom: "8px",
          }}
        >
          {mode === "update" ? "Loading Document..." : "Preparing Workspace..."}
        </h5>
        <p
          style={{
            fontSize: "0.9rem",
            color: "#6b7280",
            marginBottom: 0,
          }}
        >
          {!isMounted && "Initializing component..."}
          {isMounted &&
            !isDataReady &&
            (mode === "update"
              ? "Loading document data..."
              : "Setting up workspace...")}
          {isMounted && isDataReady && isSyncing && "Syncing document state..."}
          {isMounted && isDataReady && !isSyncing && "Almost ready..."}
        </p>

        {/* Progress Indicators */}
        <div
          className="d-flex align-items-center justify-content-center gap-2 mt-4"
          style={{ fontSize: "0.8rem", color: "#9ca3af" }}
        >
          <span className={isMounted ? "text-success fw-bold" : "text-muted"}>
            {isMounted ? "✓" : "○"} Mounted
          </span>
          <span style={{ opacity: 0.3 }}>•</span>
          <span className={isDataReady ? "text-success fw-bold" : "text-muted"}>
            {isDataReady ? "✓" : "○"} Data Loaded
          </span>
          <span style={{ opacity: 0.3 }}>•</span>
          <span className={!isSyncing ? "text-success fw-bold" : "text-muted"}>
            {!isSyncing ? "✓" : "○"} Synced
          </span>
        </div>
      </div>
    </div>
  );
};

export default DocumentLoadingScreen;
