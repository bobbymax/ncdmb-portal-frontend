/**
 * Error Recovery Hook
 * Provides retry mechanisms and error recovery strategies
 */

import { useState, useCallback } from "react";
import { errorService } from "../Services/ErrorService";
import { toast } from "react-toastify";

interface RetryOptions {
  maxAttempts?: number;
  backoffMs?: number;
  onRetry?: (attempt: number) => void;
  onSuccess?: () => void;
  onMaxAttemptsReached?: () => void;
}

export const useErrorRecovery = () => {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [lastError, setLastError] = useState<any>(null);

  /**
   * Execute a function with automatic retry on failure
   */
  const executeWithRetry = useCallback(
    async <T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> => {
      const {
        maxAttempts = 3,
        backoffMs = 1000,
        onRetry,
        onSuccess,
        onMaxAttemptsReached,
      } = options;

      let attempt = 0;
      let lastError: any;

      while (attempt < maxAttempts) {
        try {
          setIsRetrying(attempt > 0);
          setRetryCount(attempt);

          const result = await fn();

          // Success!
          setRetryCount(0);
          setIsRetrying(false);
          setLastError(null);

          if (attempt > 0) {
            toast.success("Operation successful after retry", {
              autoClose: 2000,
            });
          }

          onSuccess?.();
          return result;
        } catch (error) {
          lastError = error;
          attempt++;

          // Check if error is retryable
          if (!errorService.isRetryable(error)) {
            setLastError(error);
            throw error; // Don't retry non-retryable errors
          }

          if (attempt < maxAttempts) {
            // Calculate delay with exponential backoff
            const delay = backoffMs * Math.pow(2, attempt - 1);

            toast.info(`Retrying... (Attempt ${attempt + 1}/${maxAttempts})`, {
              autoClose: delay,
            });

            onRetry?.(attempt);

            // Wait before retrying
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }
      }

      // Max attempts reached
      setLastError(lastError);
      setIsRetrying(false);
      onMaxAttemptsReached?.();

      throw lastError;
    },
    []
  );

  /**
   * Manual retry function
   */
  const retry = useCallback(async <T>(fn: () => Promise<T>): Promise<T> => {
    setRetryCount((prev) => prev + 1);
    setIsRetrying(true);

    try {
      const result = await fn();
      setRetryCount(0);
      setIsRetrying(false);
      setLastError(null);
      return result;
    } catch (error) {
      setLastError(error);
      setIsRetrying(false);
      throw error;
    }
  }, []);

  /**
   * Reset retry state
   */
  const reset = useCallback(() => {
    setRetryCount(0);
    setIsRetrying(false);
    setLastError(null);
  }, []);

  return {
    executeWithRetry,
    retry,
    reset,
    retryCount,
    isRetrying,
    lastError,
  };
};
