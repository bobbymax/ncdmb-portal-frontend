import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * Error boundary for TemplateBoard context
 * Provides fallback state and error recovery
 */
class TemplateBoardErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console
    // TemplateBoard Error Boundary caught an error

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Update state with error info
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="template-board-error-boundary">
          <div className="error-container">
            <div className="error-icon">
              <i className="ri-error-warning-line"></i>
            </div>
            <h3>Something went wrong with the Template Builder</h3>
            <p>
              An error occurred while managing the document template state. This
              might be due to corrupted data or a temporary issue.
            </p>

            {this.state.error && (
              <details className="error-details">
                <summary>Error Details</summary>
                <pre className="error-message">{this.state.error.message}</pre>
                {this.state.errorInfo && (
                  <pre className="error-stack">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </details>
            )}

            <div className="error-actions">
              <button onClick={this.handleReset} className="btn btn-primary">
                <i className="ri-refresh-line"></i>
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="btn btn-secondary"
              >
                <i className="ri-restart-line"></i>
                Reload Page
              </button>
            </div>

            <div className="error-help">
              <p>
                <strong>Need help?</strong> If this error persists, please
                contact support with the error details above.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default TemplateBoardErrorBoundary;
