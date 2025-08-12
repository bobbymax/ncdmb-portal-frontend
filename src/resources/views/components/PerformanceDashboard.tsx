import React, { useState, useEffect, useCallback } from "react";
import RefactorValidation, {
  ComponentValidation,
} from "app/Utils/RefactorValidation";

interface PerformanceMetrics {
  renderTime: number;
  tabSwitchTime: number;
  stateUpdateTime: number;
  memoryUsage: number;
  timestamp: Date;
}

interface PerformanceDashboardProps {
  isVisible?: boolean;
  onClose?: () => void;
}

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  isVisible = false,
  onClose,
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [validationResults, setValidationResults] = useState<
    ComponentValidation[]
  >([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentMetrics, setCurrentMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    tabSwitchTime: 0,
    stateUpdateTime: 0,
    memoryUsage: 0,
    timestamp: new Date(),
  });

  // Performance monitoring
  const startPerformanceMonitoring = useCallback(() => {
    setIsRunning(true);
    const startTime = performance.now();

    // Monitor render performance
    const renderObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === "measure") {
          const renderTime = entry.duration;
          setCurrentMetrics((prev) => ({
            ...prev,
            renderTime,
            timestamp: new Date(),
          }));
        }
      });
    });

    renderObserver.observe({ entryTypes: ["measure"] });

    // Monitor memory usage
    const memoryInterval = setInterval(() => {
      if ("memory" in performance) {
        const memory = (performance as any).memory;
        setCurrentMetrics((prev) => ({
          ...prev,
          memoryUsage: memory.usedJSHeapSize / 1024 / 1024, // Convert to MB
        }));
      }
    }, 1000);

    return () => {
      renderObserver.disconnect();
      clearInterval(memoryInterval);
    };
  }, []);

  // Run validation suite
  const runValidationSuite = useCallback(async () => {
    const validator = RefactorValidation.getInstance();

    // Mock data for validation (in real app, this would come from actual component states)
    const mockContentBuilderState = {
      configState: {
        from: {
          key: "from",
          state: { process_type: "from", stage: null, group: null },
        },
        to: {
          key: "to",
          state: { process_type: "to", stage: null, group: null },
        },
        through: {
          key: "through",
          state: { process_type: "through", stage: null, group: null },
        },
      },
    };

    const mockDocumentGeneratorState = {
      configState: {
        from: {
          key: "from",
          state: { process_type: "from", stage: null, group: null },
        },
        to: {
          key: "to",
          state: { process_type: "to", stage: null, group: null },
        },
        through: {
          key: "through",
          state: { process_type: "through", stage: null, group: null },
        },
      },
    };

    const mockProcessStateData = {
      processType: "from" as const,
      currentState: { process_type: "from", stage: null, group: null },
      dependencies: { stages: [], groups: [], users: [] },
      handleStateUpdate: () => {},
    };

    const mockPerformanceMetrics = {
      renderTime: currentMetrics.renderTime,
      tabSwitchTime: currentMetrics.tabSwitchTime,
    };

    const results = validator.runComprehensiveValidation(
      mockContentBuilderState,
      mockDocumentGeneratorState,
      mockProcessStateData,
      mockPerformanceMetrics
    );

    setValidationResults(results);
  }, [currentMetrics]);

  // Export validation report
  const exportReport = useCallback(() => {
    const validator = RefactorValidation.getInstance();
    const report = validator.exportValidationResults();

    const blob = new Blob([report], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `refactor-validation-report-${
      new Date().toISOString().split("T")[0]
    }.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  // Update metrics periodically
  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setMetrics((prev) => [...prev.slice(-9), currentMetrics]);
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible, currentMetrics]);

  // Start monitoring when dashboard becomes visible
  useEffect(() => {
    if (isVisible && !isRunning) {
      const cleanup = startPerformanceMonitoring();
      return cleanup;
    }
  }, [isVisible, isRunning, startPerformanceMonitoring]);

  if (!isVisible) return null;

  return (
    <div className="performance-dashboard">
      <div className="performance-dashboard__header">
        <h3>Performance & Validation Dashboard</h3>
        <button className="btn btn-sm btn-outline-secondary" onClick={onClose}>
          <i className="ri-close-line"></i>
        </button>
      </div>

      <div className="performance-dashboard__content">
        {/* Performance Metrics */}
        <div className="performance-dashboard__section">
          <h4>Performance Metrics</h4>
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-value">
                {currentMetrics.renderTime.toFixed(2)}ms
              </div>
              <div className="metric-label">Render Time</div>
              <div
                className={`metric-status ${
                  currentMetrics.renderTime > 100 ? "warning" : "success"
                }`}
              >
                {currentMetrics.renderTime > 100 ? "⚠️ Slow" : "✅ Good"}
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-value">
                {currentMetrics.tabSwitchTime.toFixed(2)}ms
              </div>
              <div className="metric-label">Tab Switch</div>
              <div
                className={`metric-status ${
                  currentMetrics.tabSwitchTime > 50 ? "warning" : "success"
                }`}
              >
                {currentMetrics.tabSwitchTime > 50 ? "⚠️ Slow" : "✅ Good"}
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-value">
                {currentMetrics.stateUpdateTime.toFixed(2)}ms
              </div>
              <div className="metric-label">State Update</div>
              <div
                className={`metric-status ${
                  currentMetrics.stateUpdateTime > 16 ? "warning" : "success"
                }`}
              >
                {currentMetrics.stateUpdateTime > 16 ? "⚠️ Slow" : "✅ Good"}
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-value">
                {currentMetrics.memoryUsage.toFixed(2)}MB
              </div>
              <div className="metric-label">Memory Usage</div>
              <div
                className={`metric-status ${
                  currentMetrics.memoryUsage > 100 ? "warning" : "success"
                }`}
              >
                {currentMetrics.memoryUsage > 100 ? "⚠️ High" : "✅ Normal"}
              </div>
            </div>
          </div>
        </div>

        {/* Performance Chart */}
        <div className="performance-dashboard__section">
          <h4>Performance Trends</h4>
          <div className="performance-chart">
            {metrics.map((metric, index) => (
              <div
                key={index}
                className="chart-bar"
                style={{
                  height: `${Math.min(metric.renderTime / 2, 100)}px`,
                  backgroundColor:
                    metric.renderTime > 100 ? "#ff6b6b" : "#51cf66",
                }}
                title={`Render: ${metric.renderTime.toFixed(2)}ms`}
              />
            ))}
          </div>
        </div>

        {/* Validation Results */}
        <div className="performance-dashboard__section">
          <h4>Validation Results</h4>
          <div className="validation-results">
            {validationResults.map((validation, index) => (
              <div key={index} className="validation-item">
                <div
                  className={`validation-status ${
                    validation.overallSuccess ? "success" : "error"
                  }`}
                >
                  {validation.overallSuccess ? "✅" : "❌"}
                </div>
                <div className="validation-details">
                  <div className="validation-name">
                    {validation.componentName}
                  </div>
                  <div className="validation-message">
                    {validation.results.length > 0 &&
                      validation.results[0].message}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="performance-dashboard__actions">
          <button
            className="btn btn-primary me-2"
            onClick={runValidationSuite}
            disabled={isRunning}
          >
            {isRunning ? "Running..." : "Run Validation"}
          </button>
          <button className="btn btn-outline-primary" onClick={exportReport}>
            Export Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;
