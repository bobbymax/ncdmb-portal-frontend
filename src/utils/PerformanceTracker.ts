/**
 * Performance Tracking Utility
 * Non-intrusive performance monitoring for the application
 */
import { ENV } from "../config/env";

class PerformanceTracker {
  private static metrics: Map<string, number[]> = new Map();
  private static isEnabled = ENV.ENABLE_PERFORMANCE_MONITORING;

  /**
   * Track component render time
   */
  static trackComponentRender(componentName: string, renderTime: number) {
    if (!this.isEnabled) return;

    const metrics = this.metrics.get(`component_${componentName}`) || [];
    metrics.push(renderTime);

    // Keep only last 50 measurements
    if (metrics.length > 50) {
      metrics.shift();
    }

    this.metrics.set(`component_${componentName}`, metrics);
  }

  /**
   * Track API call duration
   */
  static trackApiCall(endpoint: string, duration: number) {
    if (!this.isEnabled) return;

    const key = `api_${endpoint}`;
    const metrics = this.metrics.get(key) || [];
    metrics.push(duration);

    // Keep only last 100 measurements
    if (metrics.length > 100) {
      metrics.shift();
    }

    this.metrics.set(key, metrics);
  }

  /**
   * Track calculation time
   */
  static trackCalculation(calculationType: string, duration: number) {
    if (!this.isEnabled) return;

    const key = `calc_${calculationType}`;
    const metrics = this.metrics.get(key) || [];
    metrics.push(duration);

    if (metrics.length > 50) {
      metrics.shift();
    }

    this.metrics.set(key, metrics);
  }

  /**
   * Track cache hit/miss
   */
  static trackCacheOperation(operation: "hit" | "miss", cacheKey: string) {
    if (!this.isEnabled) return;

    const key = `cache_${operation}`;
    const metrics = this.metrics.get(key) || [];
    metrics.push(1); // Count

    if (metrics.length > 200) {
      metrics.shift();
    }

    this.metrics.set(key, metrics);
  }

  /**
   * Get performance report
   */
  static getReport(): Record<string, any> {
    const report: Record<string, any> = {};

    for (const [key, values] of this.metrics) {
      if (values.length === 0) continue;

      const sum = values.reduce((a, b) => a + b, 0);
      const avg = sum / values.length;

      report[key] = {
        count: values.length,
        avg: Math.round(avg * 100) / 100,
        min: Math.min(...values),
        max: Math.max(...values),
        total: sum,
      };
    }

    return report;
  }

  /**
   * Get cache hit ratio
   */
  static getCacheHitRatio(): number {
    const hits = this.metrics.get("cache_hit") || [];
    const misses = this.metrics.get("cache_miss") || [];

    const total = hits.length + misses.length;
    if (total === 0) return 0;

    return Math.round((hits.length / total) * 100);
  }

  /**
   * Clear all metrics
   */
  static clearMetrics() {
    this.metrics.clear();
  }

  /**
   * Enable/disable tracking
   */
  static setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  /**
   * Get memory usage info
   */
  static getMemoryInfo() {
    if (!this.isEnabled || !("memory" in performance)) return null;

    const memory = (performance as any).memory;
    return {
      used: Math.round(memory.usedJSHeapSize / 1024 / 1024), // MB
      total: Math.round(memory.totalJSHeapSize / 1024 / 1024), // MB
      limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024), // MB
    };
  }
}

export default PerformanceTracker;
