/**
 * Error Handling System - Centralized Exports
 */

// Error Classes
export {
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
} from "./AppErrors";

// Error Service
export {
  errorService,
  handleGlobalError,
  ErrorSeverity,
  ErrorCategory,
  type ErrorContext,
} from "../Services/ErrorService";

// Error Context
export { ErrorProvider, useErrors } from "../Context/ErrorContext";

// Error Boundary
export { EnhancedErrorBoundary } from "../Boundaries/EnhancedErrorBoundary";

// Recovery Hooks
export { useErrorRecovery } from "../Hooks/useErrorRecovery";
export { useNetworkStatus } from "../Hooks/useNetworkStatus";

// UI Components
export {
  default as ValidationErrors,
  FieldError,
} from "../components/ValidationErrors";
