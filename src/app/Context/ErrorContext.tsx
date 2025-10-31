/**
 * Global Error Context
 * Provides centralized error handling across the application
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { errorService } from "../Services/ErrorService";
import { AppError, ValidationError } from "../Errors/AppErrors";

interface ErrorContextType {
  errors: AppError[];
  addError: (error: AppError) => void;
  clearErrors: () => void;
  clearError: (index: number) => void;
  hasErrors: boolean;
  getValidationErrors: () => ValidationError[];
  handleError: (
    error: any,
    context?: { component?: string; action?: string },
    options?: { showToast?: boolean; showAlert?: boolean; silent?: boolean }
  ) => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

interface ErrorProviderProps {
  children: ReactNode;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const [errors, setErrors] = useState<AppError[]>([]);

  const addError = useCallback((error: AppError) => {
    setErrors((prev) => [error, ...prev].slice(0, 50)); // Keep last 50 errors
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const clearError = useCallback((index: number) => {
    setErrors((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const getValidationErrors = useCallback(() => {
    return errors.filter(
      (err) => err.category === "validation"
    ) as ValidationError[];
  }, [errors]);

  const handleError = useCallback(
    (
      error: any,
      context?: { component?: string; action?: string },
      options?: { showToast?: boolean; showAlert?: boolean; silent?: boolean }
    ) => {
      const appError = errorService.handleError(error, context, options);
      addError(appError);
    },
    [addError]
  );

  const value: ErrorContextType = {
    errors,
    addError,
    clearErrors,
    clearError,
    hasErrors: errors.length > 0,
    getValidationErrors,
    handleError,
  };

  return (
    <ErrorContext.Provider value={value}>{children}</ErrorContext.Provider>
  );
};

export const useErrors = (): ErrorContextType => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error("useErrors must be used within ErrorProvider");
  }
  return context;
};
