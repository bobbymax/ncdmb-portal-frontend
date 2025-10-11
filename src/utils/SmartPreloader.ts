/**
 * Smart Preloader Utility
 * Non-intrusive component preloading for better user experience
 */
import { ENV } from "../config/env";

class SmartPreloader {
  private static preloadQueue = new Set<string>();
  private static preloadedComponents = new Set<string>();
  private static isEnabled = ENV.ENABLE_SMART_PRELOADING;

  /**
   * Preload a component on hover
   */
  static preloadOnHover(element: HTMLElement, route: string) {
    if (!this.isEnabled) return;

    element.addEventListener(
      "mouseenter",
      () => {
        this.preloadRoute(route);
      },
      { once: true }
    );
  }

  /**
   * Preload a route component
   */
  static preloadRoute(route: string) {
    if (
      !this.isEnabled ||
      this.preloadQueue.has(route) ||
      this.preloadedComponents.has(route)
    ) {
      return;
    }

    this.preloadQueue.add(route);

    // Preload component
    import(`../resources/views/crud/${route}`)
      .then(() => {
        this.preloadedComponents.add(route);
      })
      .catch((error) => {
        console.warn(`❌ Failed to preload ${route}:`, error);
      })
      .finally(() => {
        this.preloadQueue.delete(route);
      });
  }

  /**
   * Preload multiple routes
   */
  static preloadRoutes(routes: string[]) {
    if (!this.isEnabled) return;

    routes.forEach((route) => {
      setTimeout(() => this.preloadRoute(route), Math.random() * 1000); // Stagger preloading
    });
  }

  /**
   * Preload likely next routes based on current route
   */
  static preloadLikelyNextRoutes(currentRoute: string) {
    if (!this.isEnabled) return;

    const routeMap: Record<string, string[]> = {
      "crud/Claim": ["crud/PaymentBatch", "crud/Expense", "crud/Trip"],
      "crud/PaymentBatch": ["crud/Claim", "crud/Expense"],
      "crud/Expense": ["crud/Claim", "crud/PaymentBatch"],
      "crud/Trip": ["crud/Claim", "crud/Expense"],
      "crud/Document": ["crud/DocumentCategory", "crud/Template"],
      "crud/DocumentCategory": ["crud/Document", "crud/Template"],
      "crud/Template": ["crud/Document", "crud/DocumentCategory"],
    };

    const likelyRoutes = routeMap[currentRoute] || [];
    this.preloadRoutes(likelyRoutes);
  }

  /**
   * Preload data for a route
   */
  static async preloadRouteData(route: string) {
    if (!this.isEnabled) return;

    try {
      const { repo } = await import("../bootstrap/repositories");

      // Analyze route to determine what data to prefetch
      const dataRequirements = this.analyzeRouteDataRequirements(route);

      await Promise.all(
        dataRequirements.map(async (req) => {
          try {
            const repository = repo(req);
            await repository.collection(req);
          } catch (error) {
            console.warn(`❌ Failed to preload data ${req}:`, error);
          }
        })
      );
    } catch (error) {
      console.warn(`❌ Failed to preload data for ${route}:`, error);
    }
  }

  /**
   * Analyze route to determine data requirements
   */
  private static analyzeRouteDataRequirements(route: string): string[] {
    const routeDataMap: Record<string, string[]> = {
      "crud/Claim": ["funds", "departments", "users", "allowances", "cities"],
      "crud/PaymentBatch": ["funds", "departments", "users"],
      "crud/Expense": ["funds", "departments", "users"],
      "crud/Trip": ["cities", "allowances", "users"],
      "crud/Document": ["documentCategories", "templates", "users"],
      "crud/DocumentCategory": ["documents", "templates"],
      "crud/Template": ["documentCategories", "blocks"],
    };

    return routeDataMap[route] || [];
  }

  /**
   * Get preloading statistics
   */
  static getStats() {
    return {
      preloaded: this.preloadedComponents.size,
      inQueue: this.preloadQueue.size,
      enabled: this.isEnabled,
      components: Array.from(this.preloadedComponents),
    };
  }

  /**
   * Clear preloaded components
   */
  static clearPreloaded() {
    this.preloadedComponents.clear();
    this.preloadQueue.clear();
  }

  /**
   * Enable/disable preloading
   */
  static setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }
}

export default SmartPreloader;
