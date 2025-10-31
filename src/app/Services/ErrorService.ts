/**
 * Centralized Error Service
 * Handles error logging, tracking, and reporting
 */

import { toast } from "react-toastify";
import Alert from "../Support/Alert";
import {
  AppError,
  NetworkError,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  ServerError,
  NotFoundError,
  TimeoutError,
  RateLimitError,
  createErrorFromAxios,
} from "../Errors/AppErrors";

export enum ErrorSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export enum ErrorCategory {
  NETWORK = "network",
  VALIDATION = "validation",
  AUTHENTICATION = "authentication",
  AUTHORIZATION = "authorization",
  SERVER = "server",
  CLIENT = "client",
  UNKNOWN = "unknown",
}

export interface ErrorContext {
  userId?: string | number;
  url?: string;
  method?: string;
  component?: string;
  action?: string;
  timestamp?: Date;
  userAgent?: string;
  requestData?: any;
  responseData?: any;
  stackTrace?: string;
}

export interface ErrorLogEntry {
  error: AppError;
  severity: ErrorSeverity;
  timestamp: Date;
  context?: ErrorContext;
}

class ErrorService {
  private errorLog: AppError[] = [];
  private readonly maxLogSize = 100;
  private readonly isProduction = process.env.NODE_ENV === "production";

  /**
   * Log an error with full context
   */
  logError(params: {
    message: string;
    category: ErrorCategory;
    severity: ErrorSeverity;
    code?: number;
    context?: Partial<ErrorContext>;
    originalError?: Error | any;
  }): void {
    const error = new AppError(
      params.message,
      params.code,
      params.category,
      {
        ...params.context,
        timestamp: new Date(),
        userAgent: navigator.userAgent,
      } as any,
      this.isRetryableCategory(params.category)
    );

    // Add to in-memory log
    this.errorLog.unshift(error);

    // Keep log size manageable
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.pop();
    }

    // Console logging in development
    if (!this.isProduction) {
      console.group(
        `🚨 ${params.severity.toUpperCase()} Error: ${params.category}`
      );
      console.error("Message:", error.message);
      console.error("Code:", error.code);
      console.error("Context:", error.context);
      console.error("Original Error:", params.originalError);
      console.groupEnd();
    }

    // Send to external logging service (Sentry, LogRocket, etc.)
    this.sendToExternalLogger(error, params.severity, params.originalError);
  }

  /**
   * Check if error category is retryable
   */
  private isRetryableCategory(category: string): boolean {
    return category === "network" || category === "server";
  }

  /**
   * Categorize error based on status code and error type
   */
  categorizeError(error: any): ErrorCategory {
    if (!error) return ErrorCategory.UNKNOWN;

    const status = error.response?.status;

    if (!status) {
      // Network errors (no response)
      return ErrorCategory.NETWORK;
    }

    if (status === 401) return ErrorCategory.AUTHENTICATION;
    if (status === 403) return ErrorCategory.AUTHORIZATION;
    if (status === 422) return ErrorCategory.VALIDATION;
    if (status >= 400 && status < 500) return ErrorCategory.CLIENT;
    if (status >= 500) return ErrorCategory.SERVER;

    return ErrorCategory.UNKNOWN;
  }

  /**
   * Determine error severity
   */
  determineSeverity(category: ErrorCategory, status?: number): ErrorSeverity {
    switch (category) {
      case ErrorCategory.AUTHENTICATION:
      case ErrorCategory.SERVER:
        return ErrorSeverity.CRITICAL;
      case ErrorCategory.AUTHORIZATION:
      case ErrorCategory.NETWORK:
        return ErrorSeverity.HIGH;
      case ErrorCategory.VALIDATION:
        return ErrorSeverity.MEDIUM;
      default:
        return ErrorSeverity.LOW;
    }
  }

  /**
   * Extract user-friendly message from error
   */
  extractMessage(error: any): string {
    // Check for backend error message
    if (error.response?.data?.message) {
      return error.response.data.message;
    }

    // Check for validation errors
    if (error.response?.data?.errors) {
      const validationErrors = error.response.data.errors;
      if (typeof validationErrors === "object") {
        const firstError = Object.values(validationErrors)[0];
        return Array.isArray(firstError) ? firstError[0] : String(firstError);
      }
      return String(validationErrors);
    }

    // Network errors
    if (error.message === "Network Error") {
      return "Unable to connect to the server. Please check your internet connection.";
    }

    // Timeout errors
    if (error.code === "ECONNABORTED") {
      return "The request took too long. Please try again.";
    }

    // Default messages by status
    const status = error.response?.status;
    switch (status) {
      case 400:
        return "Invalid request. Please check your input.";
      case 401:
        return "Your session has expired. Please log in again.";
      case 403:
        return "You don't have permission to perform this action.";
      case 404:
        return "The requested resource was not found.";
      case 422:
        return "Validation failed. Please check your input.";
      case 429:
        return "Too many requests. Please wait a moment and try again.";
      case 500:
        return "Server error. Please try again later.";
      case 503:
        return "Service temporarily unavailable. Please try again later.";
      default:
        return error.message || "An unexpected error occurred.";
    }
  }

  /**
   * Handle error with appropriate user notification
   */
  handleError(
    error: any,
    context?: Partial<ErrorContext>,
    options?: {
      showToast?: boolean;
      showAlert?: boolean;
      silent?: boolean;
    }
  ): AppError {
    // If already an AppError, just return it
    if (error instanceof AppError) {
      if (!options?.silent) {
        const category = this.categorizeError(error);
        const severity = this.determineSeverity(category, error.code);
        this.notifyUser(error, severity, options);
      }
      return error;
    }

    const category = this.categorizeError(error);
    const severity = this.determineSeverity(category, error.response?.status);
    const message = this.extractMessage(error);

    // Log the error
    this.logError({
      message,
      category,
      severity,
      code: error.response?.status,
      context: {
        ...context,
        url: error.config?.url,
        method: error.config?.method,
        requestData: error.config?.data,
        responseData: error.response?.data,
        stackTrace: error.stack,
      },
      originalError: error,
    });

    // Create typed error from the logged error
    const appError = createErrorFromAxios(error);

    // Show user notification if not silent
    if (!options?.silent) {
      this.notifyUser(appError, severity, options);
    }

    return appError;
  }

  /**
   * Notify user based on error severity
   */
  private notifyUser(
    error: AppError,
    severity: ErrorSeverity,
    options?: { showToast?: boolean; showAlert?: boolean }
  ): void {
    const showToast = options?.showToast ?? true;
    const showAlert = options?.showAlert ?? false;

    // Critical errors get full alert
    if (severity === ErrorSeverity.CRITICAL && showAlert) {
      Alert.error("Critical Error", error.message);
      return;
    }

    // High severity errors get prominent toast
    if (
      severity === ErrorSeverity.HIGH ||
      severity === ErrorSeverity.CRITICAL
    ) {
      if (showToast) {
        toast.error(error.message, {
          autoClose: 5000,
          position: "top-right",
        });
      }
      return;
    }

    // Medium/Low errors get standard toast
    if (showToast) {
      toast.warning(error.message, {
        autoClose: 3000,
        position: "top-right",
      });
    }
  }

  /**
   * Get validation errors as field-specific object
   */
  getValidationErrors(error: any): Record<string, string[]> {
    if (error.response?.data?.errors) {
      return error.response.data.errors;
    }
    if (error.response?.data?.data) {
      return error.response.data.data;
    }
    return {};
  }

  /**
   * Get all logged errors
   */
  getErrorLog(): AppError[] {
    return [...this.errorLog];
  }

  /**
   * Get errors by category
   */
  getErrorsByCategory(category: string): AppError[] {
    return this.errorLog.filter((err) => err.category === category);
  }

  /**
   * Clear error log
   */
  clearLog(): void {
    this.errorLog = [];
  }

  /**
   * Export errors for debugging
   */
  exportErrors(): string {
    return JSON.stringify(this.errorLog, null, 2);
  }

  /**
   * Send to external logging service (placeholder for Sentry, LogRocket, etc.)
   */
  private sendToExternalLogger(
    error: AppError,
    severity: ErrorSeverity,
    originalError?: any
  ): void {
    if (!this.isProduction) return;

    // Example: Send to Sentry
    // if (window.Sentry) {
    //   window.Sentry.captureException(originalError || error, {
    //     level: severity,
    //     tags: {
    //       category: error.category,
    //       component: error.context?.component,
    //     },
    //     contexts: {
    //       error: error.context,
    //     },
    //   });
    // }

    // Example: Send to custom logging endpoint
    // fetch('/api/log-error', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ error, severity })
    // }).catch(() => {
    //   // Failed to log error - don't throw to avoid infinite loop
    // });
  }

  /**
   * Check if error is retryable
   */
  isRetryable(error: any): boolean {
    const status = error.response?.status;
    // Retry on network errors, timeouts, or 5xx errors
    return (
      !status || // Network error
      error.code === "ECONNABORTED" || // Timeout
      (status >= 500 && status < 600) // Server errors
    );
  }

  /**
   * Get retry delay based on attempt number (exponential backoff)
   */
  getRetryDelay(attempt: number): number {
    return Math.min(1000 * Math.pow(2, attempt), 10000);
  }
}

// Export singleton instance
export const errorService = new ErrorService();

// Export convenience function
export const handleGlobalError = (
  error: any,
  context?: Partial<ErrorContext>,
  options?: {
    showToast?: boolean;
    showAlert?: boolean;
    silent?: boolean;
  }
): AppError => {
  return errorService.handleError(error, context, options);
};
