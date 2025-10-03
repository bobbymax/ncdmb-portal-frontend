import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Debounces a value by delaying its update until after the specified delay
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds
 * @returns The debounced value
 */
const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Debounces a callback function by delaying its execution until after the specified delay
 * @param callback - The callback function to debounce
 * @param delay - The delay in milliseconds
 * @param deps - Dependencies array for the callback
 * @returns The debounced callback function
 */
const useDebouncedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }) as T,
    [callback, delay, ...deps]
  );
};

/**
 * Debounces a value with immediate execution on first call
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds
 * @param immediate - Whether to execute immediately on first call
 * @returns The debounced value
 */
const useDebounceImmediate = <T>(
  value: T,
  delay: number,
  immediate = false
): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const [isFirstCall, setIsFirstCall] = useState(true);

  useEffect(() => {
    if (immediate && isFirstCall) {
      setDebouncedValue(value);
      setIsFirstCall(false);
      return;
    }

    const handler = setTimeout(() => {
      setDebouncedValue(value);
      setIsFirstCall(false);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay, immediate, isFirstCall]);

  return debouncedValue;
};

/**
 * Advanced debounce hook with leading and trailing options
 * @param callback - The callback function to debounce
 * @param delay - The delay in milliseconds
 * @param options - Options for leading and trailing execution
 * @returns The debounced callback function
 */
const useAdvancedDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  options: {
    leading?: boolean;
    trailing?: boolean;
    maxWait?: number;
  } = {}
): {
  debouncedCallback: T;
  cancel: () => void;
  flush: () => void;
} => {
  const { leading = false, trailing = true, maxWait } = options;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastCallTimeRef = useRef<number>(0);
  const lastInvokeTimeRef = useRef<number>(0);
  const lastArgsRef = useRef<Parameters<T>>();

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (maxTimeoutRef.current) {
      clearTimeout(maxTimeoutRef.current);
      maxTimeoutRef.current = null;
    }
  }, []);

  const flush = useCallback(() => {
    if (timeoutRef.current && lastArgsRef.current) {
      callback(...lastArgsRef.current);
      lastInvokeTimeRef.current = Date.now();
      cancel();
    }
  }, [callback, cancel]);

  const debouncedCallback = useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      lastArgsRef.current = args;
      lastCallTimeRef.current = now;

      const isInvoking = leading && now - lastInvokeTimeRef.current >= delay;

      if (isInvoking) {
        callback(...args);
        lastInvokeTimeRef.current = now;
        return;
      }

      cancel();

      if (trailing) {
        timeoutRef.current = setTimeout(() => {
          callback(...args);
          lastInvokeTimeRef.current = Date.now();
        }, delay);
      }

      if (maxWait && !maxTimeoutRef.current) {
        maxTimeoutRef.current = setTimeout(() => {
          flush();
        }, maxWait);
      }
    }) as T,
    [callback, delay, leading, trailing, maxWait, cancel, flush]
  );

  return {
    debouncedCallback,
    cancel,
    flush,
  };
};

export {
  useDebounce,
  useDebouncedCallback,
  useDebounceImmediate,
  useAdvancedDebounce,
};
