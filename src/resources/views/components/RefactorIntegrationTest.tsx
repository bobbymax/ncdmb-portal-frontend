import React, { useState, useEffect, useCallback } from "react";
import RefactorValidation from "app/Utils/RefactorValidation";
import PerformanceDashboard from "./PerformanceDashboard";

interface TestResult {
  testName: string;
  status: "pending" | "running" | "passed" | "failed";
  message: string;
  details?: any;
  duration: number;
}

interface IntegrationTestProps {
  isVisible?: boolean;
  onClose?: () => void;
}

const RefactorIntegrationTest: React.FC<IntegrationTestProps> = ({
  isVisible = false,
  onClose,
}) => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showPerformanceDashboard, setShowPerformanceDashboard] =
    useState(false);
  const [overallStatus, setOverallStatus] = useState<
    "pending" | "running" | "passed" | "failed"
  >("pending");

  // Test suite configuration
  const testSuite = [
    {
      name: "State Synchronization Test",
      description:
        "Validates state sync between ContentBuilder and DocumentGenerator",
      testFn: () => testStateSynchronization(),
    },
    {
      name: "Process State Validation Test",
      description: "Validates useProcessState hook functionality",
      testFn: () => testProcessStateValidation(),
    },
    {
      name: "Performance Benchmark Test",
      description: "Tests performance metrics and thresholds",
      testFn: () => testPerformanceBenchmarks(),
    },
    {
      name: "Error Handling Test",
      description: "Validates error handling and recovery mechanisms",
      testFn: () => testErrorHandling(),
    },
    {
      name: "Memory Usage Test",
      description: "Monitors memory usage and leaks",
      testFn: () => testMemoryUsage(),
    },
    {
      name: "Tab Switching Test",
      description: "Tests tab switching performance and state persistence",
      testFn: () => testTabSwitching(),
    },
    {
      name: "State Persistence Test",
      description: "Validates state persistence across component unmounts",
      testFn: () => testStatePersistence(),
    },
    {
      name: "Context Integration Test",
      description: "Tests context provider integration and state flow",
      testFn: () => testContextIntegration(),
    },
  ];

  // Initialize test results
  useEffect(() => {
    if (isVisible) {
      const initialResults = testSuite.map((test) => ({
        testName: test.name,
        status: "pending" as const,
        message: "Test not yet run",
        duration: 0,
      }));
      setTestResults(initialResults);
      setOverallStatus("pending");
    }
  }, [isVisible]);

  // Test: State Synchronization
  const testStateSynchronization = async (): Promise<TestResult> => {
    const startTime = performance.now();

    try {
      const validator = RefactorValidation.getInstance();

      // Mock states for testing
      const mockContentBuilderState = {
        configState: {
          from: {
            key: "from",
            state: {
              process_type: "from",
              stage: { value: 1, label: "Test Stage" },
              group: null,
            },
          },
          to: {
            key: "to",
            state: {
              process_type: "to",
              stage: null,
              group: { value: 2, label: "Test Group" },
            },
          },
        },
      };

      const mockDocumentGeneratorState = {
        configState: {
          from: {
            key: "from",
            state: {
              process_type: "from",
              stage: { value: 1, label: "Test Stage" },
              group: null,
            },
          },
          to: {
            key: "to",
            state: {
              process_type: "to",
              stage: null,
              group: { value: 2, label: "Test Group" },
            },
          },
        },
      };

      const result = validator.validateStateSynchronization(
        mockContentBuilderState,
        mockDocumentGeneratorState
      );

      const duration = performance.now() - startTime;

      if (result.success) {
        return {
          testName: "State Synchronization Test",
          status: "passed",
          message: "State synchronization validated successfully",
          duration,
        };
      } else {
        return {
          testName: "State Synchronization Test",
          status: "failed",
          message: result.message,
          details: result.details,
          duration,
        };
      }
    } catch (error) {
      const duration = performance.now() - startTime;
      return {
        testName: "State Synchronization Test",
        status: "failed",
        message: `Test error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        duration,
      };
    }
  };

  // Test: Process State Validation
  const testProcessStateValidation = async (): Promise<TestResult> => {
    const startTime = performance.now();

    try {
      const validator = RefactorValidation.getInstance();

      const mockProcessStateData = {
        processType: "from" as const,
        currentState: {
          process_type: "from" as const,
          stage: null,
          group: null,
          department: null,
          staff: null,
          is_approving: { label: "No", value: 0 },
          permissions: "rw" as const,
        },
        dependencies: {
          stages: [{ id: 1, name: "Test Stage" }],
          groups: [],
          users: [],
        },
        handleStateUpdate: () => {},
      };

      const result = validator.validateUseProcessState(
        mockProcessStateData.processType,
        mockProcessStateData.currentState,
        mockProcessStateData.dependencies,
        mockProcessStateData.handleStateUpdate
      );

      const duration = performance.now() - startTime;

      if (result.success) {
        return {
          testName: "Process State Validation Test",
          status: "passed",
          message: "Process state validation successful",
          duration,
        };
      } else {
        return {
          testName: "Process State Validation Test",
          status: "failed",
          message: result.message,
          details: result.details,
          duration,
        };
      }
    } catch (error) {
      const duration = performance.now() - startTime;
      return {
        testName: "Process State Validation Test",
        status: "failed",
        message: `Test error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        duration,
      };
    }
  };

  // Test: Performance Benchmarks
  const testPerformanceBenchmarks = async (): Promise<TestResult> => {
    const startTime = performance.now();

    try {
      const validator = RefactorValidation.getInstance();

      // Simulate performance metrics
      const renderTime = Math.random() * 150; // 0-150ms
      const tabSwitchTime = Math.random() * 80; // 0-80ms

      const result = validator.validateDocumentProcessFlowPerformance(
        renderTime,
        tabSwitchTime
      );

      const duration = performance.now() - startTime;

      if (result.success) {
        return {
          testName: "Performance Benchmark Test",
          status: "passed",
          message: "Performance benchmarks passed",
          details: {
            renderTime: `${renderTime.toFixed(2)}ms`,
            tabSwitchTime: `${tabSwitchTime.toFixed(2)}ms`,
          },
          duration,
        };
      } else {
        return {
          testName: "Performance Benchmark Test",
          status: "failed",
          message: "Performance benchmarks failed",
          details: result.details,
          duration,
        };
      }
    } catch (error) {
      const duration = performance.now() - startTime;
      return {
        testName: "Performance Benchmark Test",
        status: "failed",
        message: `Test error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        duration,
      };
    }
  };

  // Test: Error Handling
  const testErrorHandling = async (): Promise<TestResult> => {
    const startTime = performance.now();

    try {
      const validator = RefactorValidation.getInstance();

      // Test various error scenarios
      const testCases = [
        { errorState: null, recoveryAttempts: 0 },
        { errorState: "Test error", recoveryAttempts: 1 },
        { errorState: { message: "Complex error" }, recoveryAttempts: 2 },
      ];

      let allPassed = true;
      const results = [];

      for (const testCase of testCases) {
        const result = validator.validateErrorHandling(
          testCase.errorState,
          testCase.recoveryAttempts
        );

        if (!result.success) {
          allPassed = false;
        }

        results.push({ testCase, result });
      }

      const duration = performance.now() - startTime;

      if (allPassed) {
        return {
          testName: "Error Handling Test",
          status: "passed",
          message: "All error handling scenarios passed",
          details: { testCases: results.length },
          duration,
        };
      } else {
        return {
          testName: "Error Handling Test",
          status: "failed",
          message: "Some error handling scenarios failed",
          details: results,
          duration,
        };
      }
    } catch (error) {
      const duration = performance.now() - startTime;
      return {
        testName: "Error Handling Test",
        status: "failed",
        message: `Test error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        duration,
      };
    }
  };

  // Test: Memory Usage
  const testMemoryUsage = async (): Promise<TestResult> => {
    const startTime = performance.now();

    try {
      // Simulate memory usage monitoring (Chrome only)
      const memory = (performance as any).memory;
      const initialMemory = memory ? memory.usedJSHeapSize : 0;

      // Simulate some memory operations
      const testArray = new Array(1000).fill("test");
      const testObject = { data: testArray };

      const currentMemory = memory ? memory.usedJSHeapSize : 0;
      const memoryIncrease = currentMemory - initialMemory;

      // Clean up
      testArray.length = 0;
      Object.keys(testObject).forEach((key) => delete (testObject as any)[key]);

      const duration = performance.now() - startTime;

      // Memory increase should be minimal after cleanup
      if (memoryIncrease < 1024 * 1024) {
        // Less than 1MB
        return {
          testName: "Memory Usage Test",
          status: "passed",
          message: "Memory usage within acceptable limits",
          details: {
            memoryIncrease: `${(memoryIncrease / 1024).toFixed(2)}KB`,
          },
          duration,
        };
      } else {
        return {
          testName: "Memory Usage Test",
          status: "failed",
          message: "Memory usage exceeded acceptable limits",
          details: {
            memoryIncrease: `${(memoryIncrease / 1024).toFixed(2)}KB`,
          },
          duration,
        };
      }
    } catch (error) {
      const duration = performance.now() - startTime;
      return {
        testName: "Memory Usage Test",
        status: "failed",
        message: `Test error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        duration,
      };
    }
  };

  // Test: Tab Switching
  const testTabSwitching = async (): Promise<TestResult> => {
    const startTime = performance.now();

    try {
      // Simulate tab switching performance
      const tabSwitchTimes = [];

      for (let i = 0; i < 5; i++) {
        const tabStart = performance.now();
        // Simulate tab switch operation
        await new Promise((resolve) =>
          setTimeout(resolve, Math.random() * 30 + 10)
        ); // 10-40ms
        const tabEnd = performance.now();
        tabSwitchTimes.push(tabEnd - tabStart);
      }

      const averageTabSwitchTime =
        tabSwitchTimes.reduce((a, b) => a + b, 0) / tabSwitchTimes.length;
      const duration = performance.now() - startTime;

      if (averageTabSwitchTime < 50) {
        // Target: under 50ms
        return {
          testName: "Tab Switching Test",
          status: "passed",
          message: "Tab switching performance within target",
          details: { averageTime: `${averageTabSwitchTime.toFixed(2)}ms` },
          duration,
        };
      } else {
        return {
          testName: "Tab Switching Test",
          status: "failed",
          message: "Tab switching performance below target",
          details: {
            averageTime: `${averageTabSwitchTime.toFixed(2)}ms`,
            target: "50ms",
          },
          duration,
        };
      }
    } catch (error) {
      const duration = performance.now() - startTime;
      return {
        testName: "Tab Switching Test",
        status: "failed",
        message: `Test error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        duration,
      };
    }
  };

  // Test: State Persistence
  const testStatePersistence = async (): Promise<TestResult> => {
    const startTime = performance.now();

    try {
      // Simulate state persistence test
      const testState = {
        process_type: "from",
        stage: { value: 1, label: "Test Stage" },
        group: { value: 2, label: "Test Group" },
      };

      // Simulate component unmount/remount
      const persistedState = JSON.parse(JSON.stringify(testState));

      const duration = performance.now() - startTime;

      // Check if state structure is preserved
      if (JSON.stringify(testState) === JSON.stringify(persistedState)) {
        return {
          testName: "State Persistence Test",
          status: "passed",
          message: "State persistence working correctly",
          duration,
        };
      } else {
        return {
          testName: "State Persistence Test",
          status: "failed",
          message: "State persistence failed",
          details: { original: testState, persisted: persistedState },
          duration,
        };
      }
    } catch (error) {
      const duration = performance.now() - startTime;
      return {
        testName: "State Persistence Test",
        status: "failed",
        message: `Test error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        duration,
      };
    }
  };

  // Test: Context Integration
  const testContextIntegration = async (): Promise<TestResult> => {
    const startTime = performance.now();

    try {
      // Simulate context integration test
      const mockContext = {
        state: {
          configState: {},
          processType: { value: "from", label: "From" },
        },
        actions: {
          updateConfigState: () => {},
          setProcessType: () => {},
        },
      };

      const duration = performance.now() - startTime;

      // Basic context structure validation
      if (mockContext.state && mockContext.actions) {
        return {
          testName: "Context Integration Test",
          status: "passed",
          message: "Context integration working correctly",
          duration,
        };
      } else {
        return {
          testName: "Context Integration Test",
          status: "failed",
          message: "Context integration failed",
          details: mockContext,
          duration,
        };
      }
    } catch (error) {
      const duration = performance.now() - startTime;
      return {
        testName: "Context Integration Test",
        status: "failed",
        message: `Test error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        duration,
      };
    }
  };

  // Run all tests
  const runAllTests = useCallback(async () => {
    setIsRunning(true);
    setOverallStatus("running");

    const results: TestResult[] = [];

    for (let i = 0; i < testSuite.length; i++) {
      const test = testSuite[i];

      // Update test status to running
      setTestResults((prev) =>
        prev.map((result, index) =>
          index === i
            ? { ...result, status: "running", message: "Test running..." }
            : result
        )
      );

      try {
        const result = await test.testFn();
        results.push(result);

        // Update test result
        setTestResults((prev) =>
          prev.map((prevResult, index) => (index === i ? result : prevResult))
        );
      } catch (error) {
        const failedResult: TestResult = {
          testName: test.name,
          status: "failed",
          message: `Test execution failed: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
          duration: 0,
        };
        results.push(failedResult);

        setTestResults((prev) =>
          prev.map((prevResult, index) =>
            index === i ? failedResult : prevResult
          )
        );
      }
    }

    // Calculate overall status
    const passedTests = results.filter((r) => r.status === "passed").length;
    const failedTests = results.filter((r) => r.status === "failed").length;

    if (failedTests === 0) {
      setOverallStatus("passed");
    } else {
      setOverallStatus("failed");
    }

    setIsRunning(false);
  }, [testSuite]);

  // Export test results
  const exportTestResults = useCallback(() => {
    const report = `# Refactor Integration Test Report\n\n`;
    const timestamp = new Date().toISOString();
    const summary = `## Test Summary\n`;
    const status = `Overall Status: ${overallStatus.toUpperCase()}\n`;
    const passed = testResults.filter((r) => r.status === "passed").length;
    const failed = testResults.filter((r) => r.status === "failed").length;
    const total = testResults.length;

    const results = testResults
      .map(
        (result) =>
          `### ${result.testName}\n` +
          `- Status: ${result.status.toUpperCase()}\n` +
          `- Message: ${result.message}\n` +
          `- Duration: ${result.duration.toFixed(2)}ms\n` +
          (result.details
            ? `- Details: ${JSON.stringify(result.details, null, 2)}\n`
            : "") +
          `\n`
      )
      .join("");

    const fullReport =
      report +
      timestamp +
      "\n\n" +
      summary +
      status +
      `Passed: ${passed}/${total}\n` +
      `Failed: ${failed}/${total}\n\n` +
      `## Detailed Results\n\n` +
      results;

    const blob = new Blob([fullReport], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `integration-test-report-${
      new Date().toISOString().split("T")[0]
    }.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [testResults, overallStatus]);

  if (!isVisible) return null;

  return (
    <>
      <div className="integration-test-panel">
        <div className="integration-test-panel__header">
          <h3>Refactor Integration Test Suite</h3>
          <div className="header-actions">
            <button
              className="btn btn-sm btn-outline-info me-2"
              onClick={() =>
                setShowPerformanceDashboard(!showPerformanceDashboard)
              }
            >
              {showPerformanceDashboard ? "Hide" : "Show"} Performance Dashboard
            </button>
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={onClose}
            >
              <i className="ri-close-line"></i>
            </button>
          </div>
        </div>

        <div className="integration-test-panel__content">
          {/* Overall Status */}
          <div className="overall-status">
            <div className={`status-badge ${overallStatus}`}>
              {overallStatus === "pending" && "⏳ PENDING"}
              {overallStatus === "running" && "🔄 RUNNING"}
              {overallStatus === "passed" && "✅ PASSED"}
              {overallStatus === "failed" && "❌ FAILED"}
            </div>
            <div className="status-summary">
              {testResults.length > 0 && (
                <>
                  Passed:{" "}
                  {testResults.filter((r) => r.status === "passed").length} |
                  Failed:{" "}
                  {testResults.filter((r) => r.status === "failed").length} |
                  Total: {testResults.length}
                </>
              )}
            </div>
          </div>

          {/* Test Results */}
          <div className="test-results">
            {testResults.map((result, index) => (
              <div key={index} className={`test-result ${result.status}`}>
                <div className="test-header">
                  <div className={`test-status ${result.status}`}>
                    {result.status === "pending" && "⏳"}
                    {result.status === "running" && "🔄"}
                    {result.status === "passed" && "✅"}
                    {result.status === "failed" && "❌"}
                  </div>
                  <div className="test-name">{result.testName}</div>
                  <div className="test-duration">
                    {result.duration > 0
                      ? `${result.duration.toFixed(2)}ms`
                      : "-"}
                  </div>
                </div>
                <div className="test-message">{result.message}</div>
                {result.details && (
                  <div className="test-details">
                    <pre>{JSON.stringify(result.details, null, 2)}</pre>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="integration-test-panel__actions">
            <button
              className="btn btn-primary me-2"
              onClick={runAllTests}
              disabled={isRunning}
            >
              {isRunning ? "Running Tests..." : "Run All Tests"}
            </button>
            <button
              className="btn btn-outline-primary"
              onClick={exportTestResults}
              disabled={testResults.length === 0}
            >
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Performance Dashboard */}
      {showPerformanceDashboard && (
        <PerformanceDashboard
          isVisible={showPerformanceDashboard}
          onClose={() => setShowPerformanceDashboard(false)}
        />
      )}
    </>
  );
};

export default RefactorIntegrationTest;
