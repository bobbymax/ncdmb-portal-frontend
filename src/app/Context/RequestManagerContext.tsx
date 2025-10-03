import React, {
  createContext,
  useContext,
  useRef,
  useCallback,
  ReactNode,
} from "react";
import useBatchRequests from "app/Hooks/useBatchRequests";

interface RequestManagerContextType {
  addRequest: <T>(request: () => Promise<T>) => Promise<T>;
  clearCache: (key?: string) => void;
  getCacheStats: () => { size: number; keys: string[]; entries: any[] };
  flush: () => void;
  clear: () => void;
  getBatchSize: () => number;
}

const RequestManagerContext = createContext<RequestManagerContextType | null>(
  null
);

interface RequestManagerProviderProps {
  children: ReactNode;
  batchDelay?: number;
  maxBatchSize?: number;
}

export const RequestManagerProvider: React.FC<RequestManagerProviderProps> = ({
  children,
  batchDelay = 100,
  maxBatchSize = 8,
}) => {
  const { addRequest, flush, clear, getBatchSize } = useBatchRequests(
    batchDelay,
    maxBatchSize
  );

  // Global cache management
  const cacheRef = useRef<Map<string, any>>(new Map());

  const clearCache = useCallback((key?: string) => {
    if (key) {
      cacheRef.current.delete(key);
    } else {
      cacheRef.current.clear();
    }
  }, []);

  const getCacheStats = useCallback(() => {
    const cache = cacheRef.current;
    return {
      size: cache.size,
      keys: Array.from(cache.keys()),
      entries: Array.from(cache.entries()).map(([key, value]) => ({
        key,
        size: JSON.stringify(value).length,
        timestamp: value.timestamp || "unknown",
      })),
    };
  }, []);

  const contextValue: RequestManagerContextType = {
    addRequest,
    clearCache,
    getCacheStats,
    flush,
    clear,
    getBatchSize,
  };

  return (
    <RequestManagerContext.Provider value={contextValue}>
      {children}
    </RequestManagerContext.Provider>
  );
};

export const useRequestManager = () => {
  const context = useContext(RequestManagerContext);
  if (!context) {
    throw new Error(
      "useRequestManager must be used within RequestManagerProvider"
    );
  }
  return context;
};

// Higher-order component for wrapping components with request management
export const withRequestManager = <P extends object>(
  Component: React.ComponentType<P>
) => {
  const WrappedComponent: React.FC<P> = (props) => {
    return (
      <RequestManagerProvider>
        <Component {...props} />
      </RequestManagerProvider>
    );
  };

  WrappedComponent.displayName = `withRequestManager(${
    Component.displayName || Component.name
  })`;

  return WrappedComponent;
};
