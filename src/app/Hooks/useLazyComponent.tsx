import { useState, useEffect, useCallback, ComponentType } from "react";

interface UseLazyComponentOptions {
  loadingComponent?: ComponentType;
  errorComponent?: ComponentType<{ error: Error; retry: () => void }>;
  retryDelay?: number;
  maxRetries?: number;
  fallbackComponent?: ComponentType;
}

/**
 * Hook for lazy loading React components with error handling and retry logic
 * @param importFn - Function that returns a promise resolving to the component module
 * @param options - Configuration options for the lazy loading behavior
 * @returns The loaded component or loading/error states
 */
const useLazyComponent = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: UseLazyComponentOptions = {}
) => {
  const {
    loadingComponent: LoadingComponent,
    errorComponent: ErrorComponent,
    retryDelay = 1000,
    maxRetries = 3,
    fallbackComponent: FallbackComponent,
  } = options;

  const [Component, setComponent] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const loadComponent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const module = await importFn();
      setComponent(() => module.default);
      setIsInitialLoad(false);
    } catch (err) {
      const error = err as Error;
      setError(error);
      setIsInitialLoad(false);

      // Trigger retry if we haven't exceeded max retries
      if (retryCount < maxRetries) {
        const delay = retryDelay * Math.pow(2, retryCount);
        setTimeout(() => {
          setRetryCount((prev) => prev + 1);
        }, delay);
      }
    } finally {
      setLoading(false);
    }
  }, [importFn, retryDelay, maxRetries, retryCount]);

  const retry = useCallback(() => {
    setError(null);
    setRetryCount(0);
    setLoading(true);
    loadComponent();
  }, [loadComponent]);

  const reset = useCallback(() => {
    setComponent(null);
    setError(null);
    setRetryCount(0);
    setLoading(true);
    setIsInitialLoad(true);
  }, []);

  // Initial load
  useEffect(() => {
    if (isInitialLoad) {
      loadComponent();
    }
  }, [isInitialLoad, loadComponent]);

  // Retry effect
  useEffect(() => {
    if (retryCount > 0) {
      const timer = setTimeout(() => {
        loadComponent();
      }, retryDelay * Math.pow(2, retryCount - 1));

      return () => clearTimeout(timer);
    }
  }, [retryCount, loadComponent, retryDelay]);

  // Return loading state
  if (loading) {
    return {
      component: LoadingComponent ? (
        <LoadingComponent />
      ) : (
        <div>Loading...</div>
      ),
      loading: true,
      error: null,
      retry,
      reset,
    };
  }

  // Return error state
  if (error) {
    const errorElement = ErrorComponent ? (
      <ErrorComponent error={error} retry={retry} />
    ) : (
      <div className="lazy-component-error">
        <div className="error-message">
          <i className="ri-error-warning-line"></i>
          <span>Error loading component: {error.message}</span>
        </div>
        {retryCount < maxRetries && (
          <button onClick={retry} className="retry-button">
            <i className="ri-refresh-line"></i>
            Retry ({retryCount + 1}/{maxRetries})
          </button>
        )}
        {retryCount >= maxRetries && (
          <div className="max-retries-reached">
            <span>Maximum retries reached</span>
            <button onClick={reset} className="reset-button">
              <i className="ri-restart-line"></i>
              Reset
            </button>
          </div>
        )}
      </div>
    );

    return {
      component: errorElement,
      loading: false,
      error,
      retry,
      reset,
    };
  }

  // Return loaded component
  return {
    component: Component,
    loading: false,
    error: null,
    retry,
    reset,
  };
};

/**
 * Hook for preloading components without rendering them
 * @param importFn - Function that returns a promise resolving to the component module
 * @returns Object with preload function and loading state
 */
const useComponentPreloader = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
) => {
  const [preloaded, setPreloaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const preload = useCallback(async () => {
    if (preloaded || loading) return;

    try {
      setLoading(true);
      setError(null);
      await importFn();
      setPreloaded(true);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [importFn, preloaded, loading]);

  return {
    preload,
    preloaded,
    loading,
    error,
  };
};

/**
 * Hook for lazy loading multiple components
 * @param importFns - Array of functions that return promises resolving to component modules
 * @param options - Configuration options for the lazy loading behavior
 * @returns Array of lazy component results
 */
const useLazyComponents = <T extends ComponentType<any>>(
  importFns: (() => Promise<{ default: T }>)[],
  options: UseLazyComponentOptions = {}
) => {
  return importFns.map((importFn) => useLazyComponent(importFn, options));
};

export { useLazyComponent, useComponentPreloader, useLazyComponents };
