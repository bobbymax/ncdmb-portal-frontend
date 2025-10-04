/**
 * Performance Debugger Component
 * Shows performance metrics in development mode
 */
import React, { useState, useEffect } from "react";
import PerformanceTracker from "../utils/PerformanceTracker";
import SmartPreloader from "../utils/SmartPreloader";
import { ENV } from "../config/env";

interface PerformanceDebuggerProps {
  show?: boolean;
}

export const PerformanceDebugger: React.FC<PerformanceDebuggerProps> = ({
  show = ENV.NODE_ENV === "development",
}) => {
  const [metrics, setMetrics] = useState<any>({});
  const [memoryInfo, setMemoryInfo] = useState<any>(null);
  const [preloaderStats, setPreloaderStats] = useState<any>({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!show) return;

    const interval = setInterval(() => {
      setMetrics(PerformanceTracker.getReport());
      setMemoryInfo(PerformanceTracker.getMemoryInfo());
      setPreloaderStats(SmartPreloader.getStats());
    }, 5000);

    return () => clearInterval(interval);
  }, [show]);

  if (!show) return null;

  const cacheHitRatio = PerformanceTracker.getCacheHitRatio();

  return (
    <div className="performance-debugger">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="debug-toggle"
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 9999,
          background: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "50%",
          width: "50px",
          height: "50px",
          cursor: "pointer",
          fontSize: "12px",
        }}
      >
        {isVisible ? "📊" : "⚡"}
      </button>

      {isVisible && (
        <div
          className="debug-panel"
          style={{
            position: "fixed",
            bottom: "80px",
            right: "20px",
            background: "rgba(0, 0, 0, 0.9)",
            color: "white",
            padding: "15px",
            borderRadius: "8px",
            maxWidth: "400px",
            maxHeight: "500px",
            overflow: "auto",
            fontSize: "12px",
            zIndex: 9998,
            fontFamily: "monospace",
          }}
        >
          <h3 style={{ margin: "0 0 10px 0", color: "#00ff00" }}>
            ⚡ Performance Metrics
          </h3>

          {/* Memory Usage */}
          {memoryInfo && (
            <div style={{ marginBottom: "15px" }}>
              <h4 style={{ color: "#ffa500", margin: "5px 0" }}>
                🧠 Memory Usage
              </h4>
              <div>
                Used: {memoryInfo.used}MB / {memoryInfo.total}MB
              </div>
              <div>Limit: {memoryInfo.limit}MB</div>
              <div
                style={{
                  background:
                    memoryInfo.used / memoryInfo.limit > 0.8
                      ? "#ff4444"
                      : "#444",
                  height: "4px",
                  borderRadius: "2px",
                  marginTop: "5px",
                }}
              >
                <div
                  style={{
                    background: "#00ff00",
                    height: "100%",
                    width: `${(memoryInfo.used / memoryInfo.limit) * 100}%`,
                    borderRadius: "2px",
                  }}
                ></div>
              </div>
            </div>
          )}

          {/* Cache Performance */}
          <div style={{ marginBottom: "15px" }}>
            <h4 style={{ color: "#ffa500", margin: "5px 0" }}>
              💾 Cache Performance
            </h4>
            <div>Hit Ratio: {cacheHitRatio}%</div>
            <div
              style={{
                background:
                  cacheHitRatio > 70
                    ? "#00ff00"
                    : cacheHitRatio > 40
                    ? "#ffa500"
                    : "#ff4444",
                height: "4px",
                borderRadius: "2px",
                marginTop: "5px",
              }}
            >
              <div
                style={{
                  background: "#fff",
                  height: "100%",
                  width: `${cacheHitRatio}%`,
                  borderRadius: "2px",
                }}
              ></div>
            </div>
          </div>

          {/* API Performance */}
          {Object.entries(metrics).filter(([key]) => key.startsWith("api_"))
            .length > 0 && (
            <div style={{ marginBottom: "15px" }}>
              <h4 style={{ color: "#ffa500", margin: "5px 0" }}>
                🌐 API Performance
              </h4>
              {Object.entries(metrics)
                .filter(([key]) => key.startsWith("api_"))
                .slice(0, 5)
                .map(([key, data]: [string, any]) => (
                  <div key={key} style={{ marginBottom: "5px" }}>
                    <div>
                      {key.replace("api_", "")}: {data.avg}ms avg ({data.count}{" "}
                      calls)
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Component Performance */}
          {Object.entries(metrics).filter(([key]) =>
            key.startsWith("component_")
          ).length > 0 && (
            <div style={{ marginBottom: "15px" }}>
              <h4 style={{ color: "#ffa500", margin: "5px 0" }}>
                ⚛️ Component Performance
              </h4>
              {Object.entries(metrics)
                .filter(([key]) => key.startsWith("component_"))
                .slice(0, 5)
                .map(([key, data]: [string, any]) => (
                  <div key={key} style={{ marginBottom: "5px" }}>
                    <div>
                      {key.replace("component_", "")}: {data.avg}ms avg (
                      {data.count} renders)
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Preloader Stats */}
          <div style={{ marginBottom: "15px" }}>
            <h4 style={{ color: "#ffa500", margin: "5px 0" }}>
              🚀 Preloader Stats
            </h4>
            <div>Preloaded: {preloaderStats.preloaded || 0}</div>
            <div>In Queue: {preloaderStats.inQueue || 0}</div>
            <div>Enabled: {preloaderStats.enabled ? "✅" : "❌"}</div>
          </div>

          {/* Actions */}
          <div
            style={{
              marginTop: "15px",
              borderTop: "1px solid #444",
              paddingTop: "10px",
            }}
          >
            <button
              onClick={() => PerformanceTracker.clearMetrics()}
              style={{
                background: "#ff4444",
                color: "white",
                border: "none",
                padding: "5px 10px",
                borderRadius: "4px",
                cursor: "pointer",
                marginRight: "10px",
                fontSize: "11px",
              }}
            >
              Clear Metrics
            </button>
            <button
              onClick={() => SmartPreloader.clearPreloaded()}
              style={{
                background: "#ffa500",
                color: "white",
                border: "none",
                padding: "5px 10px",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "11px",
              }}
            >
              Clear Cache
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceDebugger;
