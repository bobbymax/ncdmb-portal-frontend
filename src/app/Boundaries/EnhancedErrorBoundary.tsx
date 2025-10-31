/**
 * Enhanced Error Boundary with Logging and Recovery
 */

import React, { Component, ErrorInfo, ReactNode } from "react";
import {
  errorService,
  ErrorCategory,
  ErrorSeverity,
} from "../Services/ErrorService";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: any[];
  componentName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorCount: number;
}

export class EnhancedErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to ErrorService
    errorService.logError({
      message: error.message,
      category: ErrorCategory.CLIENT,
      severity: ErrorSeverity.HIGH,
      context: {
        component: this.props.componentName || "Unknown Component",
        stackTrace: errorInfo.componentStack || undefined,
      },
      originalError: error,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Update state
    this.setState((prev) => ({
      error,
      errorInfo,
      errorCount: prev.errorCount + 1,
    }));
  }

  componentDidUpdate(prevProps: Props) {
    // Reset error boundary when resetKeys change
    if (this.props.resetKeys && prevProps.resetKeys) {
      const hasResetKeyChanged = this.props.resetKeys.some(
        (key, index) => key !== prevProps.resetKeys?.[index]
      );

      if (hasResetKeyChanged && this.state.hasError) {
        this.handleReset();
      }
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="error-boundary-container" style={styles.container}>
          <div className="error-boundary-content" style={styles.content}>
            <div className="error-icon" style={styles.icon}>
              <i
                className="ri-error-warning-line"
                style={{ fontSize: "3rem", color: "#ef4444" }}
              ></i>
            </div>

            <h2 style={styles.title}>Oops! Something went wrong</h2>

            <p style={styles.description}>
              We encountered an unexpected error. Our team has been notified and
              is working on a fix.
            </p>

            {this.state.errorCount > 1 && (
              <div style={styles.warningBox}>
                <i className="ri-alert-line"></i>
                <span>
                  This error has occurred {this.state.errorCount} times.
                  Consider reloading the page.
                </span>
              </div>
            )}

            <div style={styles.actions}>
              <button
                onClick={this.handleReset}
                style={{ ...styles.button, ...styles.primaryButton }}
                className="btn-reset"
              >
                <i className="ri-refresh-line"></i>
                Try Again
              </button>

              <button
                onClick={this.handleReload}
                style={{ ...styles.button, ...styles.secondaryButton }}
                className="btn-reload"
              >
                <i className="ri-restart-line"></i>
                Reload Page
              </button>
            </div>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <details style={styles.details}>
                <summary style={styles.summary}>
                  Error Details (Development Only)
                </summary>
                <div style={styles.errorDetails}>
                  <p>
                    <strong>Error:</strong> {this.state.error.message}
                  </p>
                  <p>
                    <strong>Component:</strong>{" "}
                    {this.props.componentName || "Unknown"}
                  </p>
                  <pre style={styles.stack}>{this.state.error.stack}</pre>
                  {this.state.errorInfo && (
                    <pre style={styles.stack}>
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "400px",
    padding: "2rem",
  },
  content: {
    maxWidth: "600px",
    width: "100%",
    textAlign: "center",
    background: "white",
    borderRadius: "12px",
    padding: "3rem 2rem",
    boxShadow:
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  },
  icon: {
    marginBottom: "1.5rem",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: 600,
    color: "#1e293b",
    marginBottom: "0.75rem",
  },
  description: {
    fontSize: "1rem",
    color: "#64748b",
    marginBottom: "1.5rem",
    lineHeight: 1.6,
  },
  warningBox: {
    background: "#fef3c7",
    border: "1px solid #fde68a",
    borderRadius: "8px",
    padding: "1rem",
    marginBottom: "1.5rem",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    color: "#92400e",
  },
  actions: {
    display: "flex",
    gap: "1rem",
    justifyContent: "center",
    marginBottom: "1.5rem",
  },
  button: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.75rem 1.5rem",
    borderRadius: "8px",
    border: "none",
    fontSize: "0.875rem",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  primaryButton: {
    background: "#059669",
    color: "white",
  },
  secondaryButton: {
    background: "#6b7280",
    color: "white",
  },
  details: {
    textAlign: "left",
    marginTop: "1.5rem",
    padding: "1rem",
    background: "#f8fafc",
    borderRadius: "8px",
  },
  summary: {
    cursor: "pointer",
    fontWeight: 500,
    marginBottom: "0.75rem",
  },
  errorDetails: {
    marginTop: "0.75rem",
  },
  stack: {
    background: "#1e293b",
    color: "#e2e8f0",
    padding: "1rem",
    borderRadius: "6px",
    overflow: "auto",
    fontSize: "0.75rem",
    marginTop: "0.5rem",
  },
};

export default EnhancedErrorBoundary;
