import { useMemo } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useStateContext } from "app/Context/ContentContext";
import { AuthPageResponseData } from "app/Repositories/Page/data";
import repositories from "bootstrap/repositories";

export interface BreadcrumbItem {
  label: string;
  path: string;
  icon?: string;
  isActive: boolean;
}

/**
 * Advanced breadcrumb hook that intelligently generates breadcrumbs
 * based on URL, page hierarchy, and view configurations
 */
export const useBreadcrumbs = (): BreadcrumbItem[] => {
  const { pathname } = useLocation();
  const { pages } = useStateContext();
  const params = useParams();

  return useMemo(() => {
    const breadcrumbs: BreadcrumbItem[] = [];

    // Always start with Home/Dashboard
    breadcrumbs.push({
      label: "Dashboard",
      path: "/insights",
      icon: "ri-dashboard-line",
      isActive: pathname === "/insights",
    });

    if (pathname === "/insights" || pathname === "/") {
      return breadcrumbs;
    }

    // Find current view from repositories
    let currentView = null;
    let currentRepo = null;

    for (const repo of repositories) {
      const view = repo.views.find((v) => {
        const viewPath = v.frontend_path.replace(/:\w+/g, "[^/]+");
        const regex = new RegExp(`^${viewPath}$`);
        return regex.test(pathname);
      });

      if (view) {
        currentView = view;
        currentRepo = repo;
        break;
      }
    }

    // Build breadcrumb hierarchy
    const segments = pathname.split("/").filter(Boolean);

    // First segment (app level - e.g., /desk, /hub, /admin-centre)
    if (segments.length > 0) {
      const appPath = `/${segments[0]}`;
      const appPage = pages.find((p) => p.path === appPath && p.type === "app");

      if (appPage) {
        breadcrumbs.push({
          label: appPage.name || appPage.label,
          path: appPath,
          icon: appPage.icon,
          isActive: pathname === appPath,
        });
      } else {
        // Fallback: capitalize segment
        breadcrumbs.push({
          label: segments[0].charAt(0).toUpperCase() + segments[0].slice(1),
          path: appPath,
          isActive: pathname === appPath,
        });
      }
    }

    // Second segment (module level - e.g., /desk/projects)
    if (segments.length > 1 && !isParamSegment(segments[1])) {
      const modulePath = `/${segments[0]}/${segments[1]}`;
      const modulePage = pages.find((p) => p.path === modulePath);

      if (modulePage) {
        breadcrumbs.push({
          label: modulePage.name || modulePage.label,
          path: modulePath,
          icon: modulePage.icon,
          isActive: pathname === modulePath,
        });
      } else if (currentView && currentView.index_path) {
        // Use index_path from view configuration
        breadcrumbs.push({
          label: extractModuleName(segments[1]),
          path: currentView.index_path,
          isActive: pathname === currentView.index_path,
        });
      } else {
        breadcrumbs.push({
          label: extractModuleName(segments[1]),
          path: modulePath,
          isActive: pathname === modulePath,
        });
      }
    }

    // Handle specific actions (create, manage, view)
    const lastSegment = segments[segments.length - 1];
    const secondLastSegment =
      segments.length > 1 ? segments[segments.length - 2] : null;

    if (lastSegment === "create") {
      breadcrumbs.push({
        label: currentView?.action || "Create New",
        path: pathname,
        icon: "ri-add-circle-line",
        isActive: true,
      });
      // Mark previous as inactive
      if (breadcrumbs.length > 1) {
        breadcrumbs[breadcrumbs.length - 2].isActive = false;
      }
    } else if (
      lastSegment === "manage" &&
      secondLastSegment &&
      isParamSegment(secondLastSegment)
    ) {
      const resourceId = params.id || secondLastSegment;
      breadcrumbs.push({
        label: currentView?.title || `Edit #${resourceId}`,
        path: pathname,
        icon: "ri-edit-line",
        isActive: true,
      });
      if (breadcrumbs.length > 1) {
        breadcrumbs[breadcrumbs.length - 2].isActive = false;
      }
    } else if (
      lastSegment === "view" &&
      secondLastSegment &&
      isParamSegment(secondLastSegment)
    ) {
      const resourceId = params.id || secondLastSegment;
      breadcrumbs.push({
        label: currentView?.title || `View #${resourceId}`,
        path: pathname,
        icon: "ri-eye-line",
        isActive: true,
      });
      if (breadcrumbs.length > 1) {
        breadcrumbs[breadcrumbs.length - 2].isActive = false;
      }
    }

    // Mark the last breadcrumb as active
    if (
      breadcrumbs.length > 0 &&
      !breadcrumbs[breadcrumbs.length - 1].isActive
    ) {
      breadcrumbs[breadcrumbs.length - 1].isActive = true;
    }

    return breadcrumbs;
  }, [pathname, pages, params]);
};

/**
 * Check if a segment is a parameter (ID, create, manage, view)
 */
const isParamSegment = (segment: string): boolean => {
  return (
    /^\d+$/.test(segment) ||
    ["create", "manage", "view", "categories"].includes(segment)
  );
};

/**
 * Extract module name from segment
 */
const extractModuleName = (segment: string): string => {
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

/**
 * Get breadcrumb path up to a specific index
 */
export const useBreadcrumbPath = (index: number): string => {
  const breadcrumbs = useBreadcrumbs();
  return index < breadcrumbs.length ? breadcrumbs[index].path : "/insights";
};

/**
 * Get parent breadcrumb (useful for back navigation)
 */
export const useParentPath = (): string => {
  const breadcrumbs = useBreadcrumbs();
  return breadcrumbs.length > 1
    ? breadcrumbs[breadcrumbs.length - 2].path
    : "/insights";
};
