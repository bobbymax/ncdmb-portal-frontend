/**
 * Typed Error Classes for Different Scenarios
 */

export class AppError extends Error {
  public readonly code: number;
  public readonly category: string;
  public readonly context?: Record<string, any>;
  public readonly isRetryable: boolean;

  constructor(
    message: string,
    code: number = 500,
    category: string = "unknown",
    context?: Record<string, any>,
    isRetryable: boolean = false
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.category = category;
    this.context = context;
    this.isRetryable = isRetryable;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NetworkError extends AppError {
  constructor(
    message: string = "Network connection failed",
    context?: Record<string, any>
  ) {
    super(message, 0, "network", context, true);
  }
}

export class AuthenticationError extends AppError {
  constructor(
    message: string = "Authentication failed",
    context?: Record<string, any>
  ) {
    super(message, 401, "authentication", context, false);
  }
}

export class AuthorizationError extends AppError {
  constructor(
    message: string = "You don't have permission to perform this action",
    context?: Record<string, any>
  ) {
    super(message, 403, "authorization", context, false);
  }
}

export class ValidationError extends AppError {
  public readonly errors: Record<string, string[]>;

  constructor(
    message: string = "Validation failed",
    errors: Record<string, string[]> = {},
    context?: Record<string, any>
  ) {
    super(message, 422, "validation", context, false);
    this.errors = errors;
  }

  getFieldError(field: string): string | null {
    return this.errors[field]?.[0] || null;
  }

  getAllErrors(): string[] {
    return Object.values(this.errors).flat();
  }
}

export class ServerError extends AppError {
  constructor(
    message: string = "Server error occurred",
    code: number = 500,
    context?: Record<string, any>
  ) {
    super(message, code, "server", context, true);
  }
}

export class NotFoundError extends AppError {
  constructor(
    message: string = "Resource not found",
    context?: Record<string, any>
  ) {
    super(message, 404, "client", context, false);
  }
}

export class TimeoutError extends AppError {
  constructor(
    message: string = "Request timeout",
    context?: Record<string, any>
  ) {
    super(message, 408, "network", context, true);
  }
}

export class RateLimitError extends AppError {
  public readonly retryAfter?: number;

  constructor(
    message: string = "Too many requests",
    retryAfter?: number,
    context?: Record<string, any>
  ) {
    super(message, 429, "client", context, true);
    this.retryAfter = retryAfter;
  }
}

/**
 * Factory function to create appropriate error from axios error
 */
export function createErrorFromAxios(error: any): AppError {
  const status = error.response?.status;
  const message = error.response?.data?.message || error.message;
  const context = {
    url: error.config?.url,
    method: error.config?.method,
    requestData: error.config?.data,
    responseData: error.response?.data,
  };

  // Network errors (no response)
  if (!status) {
    if (error.code === "ECONNABORTED") {
      return new TimeoutError(message, context);
    }
    return new NetworkError(message, context);
  }

  // HTTP status-based errors
  switch (status) {
    case 401:
      return new AuthenticationError(message, context);
    case 403:
      return new AuthorizationError(message, context);
    case 404:
      return new NotFoundError(message, context);
    case 422:
      return new ValidationError(
        message,
        error.response?.data?.errors || {},
        context
      );
    case 429:
      return new RateLimitError(
        message,
        error.response?.headers?.["retry-after"],
        context
      );
    case 500:
    case 502:
    case 503:
    case 504:
      return new ServerError(message, status, context);
    default:
      return new AppError(message, status, "unknown", context, status >= 500);
  }
}
