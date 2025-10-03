import { useState, useCallback, useRef } from "react";

interface BatchRequest<T = any> {
  id: string;
  request: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
}

class RequestBatcher {
  private requests: BatchRequest[] = [];
  private timeoutId: NodeJS.Timeout | null = null;
  private readonly batchDelay: number;
  private readonly maxBatchSize: number;

  constructor(batchDelay = 100, maxBatchSize = 10) {
    this.batchDelay = batchDelay;
    this.maxBatchSize = maxBatchSize;
  }

  addRequest<T>(request: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const batchRequest: BatchRequest<T> = {
        id: Math.random().toString(36).substr(2, 9),
        request,
        resolve,
        reject,
      };

      this.requests.push(batchRequest);

      // Process immediately if batch is full
      if (this.requests.length >= this.maxBatchSize) {
        this.processBatch();
        return;
      }

      // Set timeout to process batch
      if (!this.timeoutId) {
        this.timeoutId = setTimeout(() => {
          this.processBatch();
        }, this.batchDelay);
      }
    });
  }

  private async processBatch() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    const currentBatch = [...this.requests];
    this.requests = [];

    if (currentBatch.length === 0) return;

    try {
      // Execute all requests in parallel
      const results = await Promise.allSettled(
        currentBatch.map((req) => req.request())
      );

      results.forEach((result, index) => {
        const request = currentBatch[index];
        if (result.status === "fulfilled") {
          request.resolve(result.value);
        } else {
          request.reject(result.reason);
        }
      });
    } catch (error) {
      // Handle batch processing error
      currentBatch.forEach((request) => {
        request.reject(error as Error);
      });
    }
  }

  // Force process current batch
  flush(): void {
    if (this.requests.length > 0) {
      this.processBatch();
    }
  }

  // Clear pending requests
  clear(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    // Reject all pending requests
    this.requests.forEach((request) => {
      request.reject(new Error("Request batch cleared"));
    });

    this.requests = [];
  }

  // Get current batch size
  getBatchSize(): number {
    return this.requests.length;
  }
}

const useBatchRequests = (batchDelay = 100, maxBatchSize = 10) => {
  const batcherRef = useRef<RequestBatcher | null>(null);

  if (!batcherRef.current) {
    batcherRef.current = new RequestBatcher(batchDelay, maxBatchSize);
  }

  const addRequest = useCallback(<T>(request: () => Promise<T>): Promise<T> => {
    return batcherRef.current!.addRequest(request);
  }, []);

  const flush = useCallback(() => {
    batcherRef.current?.flush();
  }, []);

  const clear = useCallback(() => {
    batcherRef.current?.clear();
  }, []);

  const getBatchSize = useCallback(() => {
    return batcherRef.current?.getBatchSize() || 0;
  }, []);

  return {
    addRequest,
    flush,
    clear,
    getBatchSize,
  };
};

export default useBatchRequests;
