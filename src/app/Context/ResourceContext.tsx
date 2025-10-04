import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  ReactNode,
} from "react";
import { useLocation } from "react-router-dom";
import { useRequestManager } from "./RequestManagerContext";
import { useAuth } from "./AuthContext";
import { repo } from "../../bootstrap/repositories";
import { ENV } from "../../config/env";
import PerformanceTracker from "../../utils/PerformanceTracker";

// Import all resource types
import { UserResponseData } from "../Repositories/User/data";
import { DepartmentResponseData } from "../Repositories/Department/data";
import { FundResponseData } from "../Repositories/Fund/data";
import { GroupResponseData } from "../Repositories/Group/data";
import { WorkflowStageResponseData } from "../Repositories/WorkflowStage/data";
import { DocumentActionResponseData } from "../Repositories/DocumentAction/data";
import { CarderResponseData } from "../Repositories/Carder/data";
import { DocumentTypeResponseData } from "../Repositories/DocumentType/data";
import { WorkflowResponseData } from "../Repositories/Workflow/data";

// Resource types mapping
export type ResourceType =
  | "users"
  | "departments"
  | "funds"
  | "groups"
  | "workflowStages"
  | "documentActions"
  | "services"
  | "carders"
  | "documentTypes"
  | "workflows"
  | "projects";

export type ResourceData =
  | UserResponseData[]
  | DepartmentResponseData[]
  | FundResponseData[]
  | GroupResponseData[]
  | WorkflowStageResponseData[]
  | DocumentActionResponseData[]
  | string[]
  | CarderResponseData[]
  | DocumentTypeResponseData[]
  | WorkflowResponseData[]
  | any[];

// Resource map interface
export interface ResourceMap {
  users: UserResponseData[];
  departments: DepartmentResponseData[];
  funds: FundResponseData[];
  groups: GroupResponseData[];
  workflowStages: WorkflowStageResponseData[];
  documentActions: DocumentActionResponseData[];
  services: string[];
  carders: CarderResponseData[];
  documentTypes: DocumentTypeResponseData[];
  workflows: WorkflowResponseData[];
  projects: any[];
}

// Loading states interface
export interface LoadingMap {
  users: boolean;
  departments: boolean;
  funds: boolean;
  groups: boolean;
  workflowStages: boolean;
  documentActions: boolean;
  services: boolean;
  carders: boolean;
  documentTypes: boolean;
  workflows: boolean;
  projects: boolean;
}

// Cache information interface
export interface CacheInfo {
  timestamp: number;
  ttl: number;
  sessionId: string | null;
}

// Route to resource mapping
export interface RouteResourceMap {
  [route: string]: ResourceType[];
}

// Resource context interface
export interface ResourceContextType {
  // Resource data
  resources: ResourceMap;

  // Loading states
  loading: LoadingMap;

  // Cache information
  cache: CacheInfo;

  // Actions
  loadResources: (
    resourceTypes: ResourceType[],
    forceRefresh?: boolean
  ) => Promise<void>;
  loadResourcesForRoute: (route: string) => Promise<void>;
  getResource: (type: ResourceType) => ResourceData;
  getResourceById: (type: ResourceType, id: number) => any;
  clearCache: () => void;
  refreshResource: (type: ResourceType) => Promise<void>;

  // Status
  isResourceLoaded: (type: ResourceType) => boolean;
  areResourcesLoaded: (types: ResourceType[]) => boolean;
  getLoadingStatus: () => { loading: boolean; loaded: number; total: number };
}

// Create context
const ResourceContext = createContext<ResourceContextType | null>(null);

// Route to resource mapping configuration
const ROUTE_RESOURCE_MAP: RouteResourceMap = {
  // Document management routes
  "/desk/folders": ["departments", "users", "funds", "groups"],
  "/desk/claims": [
    "departments",
    "users",
    "funds",
    "groups",
    "workflowStages",
    "documentActions",
  ],
  "/desk/payment-batches": [
    "departments",
    "users",
    "funds",
    "groups",
    "workflowStages",
  ],
  "/desk/progress-trackers": [
    "departments",
    "users",
    "workflowStages",
    "documentActions",
  ],

  // Document builder routes
  "/desk/builder": [
    "departments",
    "users",
    "funds",
    "groups",
    "workflowStages",
    "documentActions",
    "carders",
    "documentTypes",
    "workflows",
  ],
  "/desk/templates": [
    "departments",
    "users",
    "funds",
    "groups",
    "workflowStages",
    "documentActions",
  ],

  // Settings and admin routes
  "/desk/settings": [
    "departments",
    "users",
    "groups",
    "workflowStages",
    "documentActions",
  ],
  "/desk/admin": [
    "departments",
    "users",
    "funds",
    "groups",
    "workflowStages",
    "documentActions",
    "carders",
    "documentTypes",
    "workflows",
  ],

  // Default fallback - load essential resources
  default: ["departments", "users", "funds", "groups"],
};

// Resource provider component
interface ResourceProviderProps {
  children: ReactNode;
}

export const ResourceProvider: React.FC<ResourceProviderProps> = ({
  children,
}) => {
  const { addRequest } = useRequestManager();
  const { staff } = useAuth();
  const location = useLocation();

  // State management
  const [resources, setResources] = useState<ResourceMap>({
    users: [],
    departments: [],
    funds: [],
    groups: [],
    workflowStages: [],
    documentActions: [],
    services: [],
    carders: [],
    documentTypes: [],
    workflows: [],
    projects: [],
  });

  const [loading, setLoading] = useState<LoadingMap>({
    users: false,
    departments: false,
    funds: false,
    groups: false,
    workflowStages: false,
    documentActions: false,
    services: false,
    carders: false,
    documentTypes: false,
    workflows: false,
    projects: false,
  });

  // Cache management
  const [cache, setCache] = useState<CacheInfo>({
    timestamp: Date.now(),
    ttl: ENV.CACHE_TTL, // 5 minutes default
    sessionId: staff?.id?.toString() || null,
  });

  // Update cache when user changes and clear resources when user logs out
  useEffect(() => {
    if (staff?.id && staff?.is_logged_in) {
      // User is logged in - update cache
      setCache((prev) => ({
        ...prev,
        sessionId: staff.id.toString(),
        timestamp: Date.now(),
      }));
    } else {
      // User is not logged in - clear resources and cache
      console.log("🧹 User logged out, clearing resources");
      setResources({
        users: [],
        departments: [],
        funds: [],
        groups: [],
        workflowStages: [],
        documentActions: [],
        services: [],
        carders: [],
        documentTypes: [],
        workflows: [],
        projects: [],
      });
      setCache((prev) => ({
        ...prev,
        sessionId: null,
        timestamp: Date.now(),
      }));
    }
  }, [staff?.id, staff?.is_logged_in]);

  // Repository mapping
  const repositoryMap = useMemo(
    () => ({
      users: () => repo("user"),
      departments: () => repo("department"),
      funds: () => repo("fund"),
      groups: () => repo("group"),
      workflowStages: () => repo("workflowStage"),
      documentActions: () => repo("documentAction"),
      carders: () => repo("carder"),
      documentTypes: () => repo("documentType"),
      workflows: () => repo("workflow"),
      projects: () => repo("project"),
    }),
    []
  );

  // Check if cache is expired
  const isCacheExpired = useCallback(() => {
    return Date.now() - cache.timestamp > cache.ttl;
  }, [cache]);

  // Check if resource is loaded
  const isResourceLoaded = useCallback(
    (type: ResourceType): boolean => {
      return resources[type] && resources[type].length > 0;
    },
    [resources]
  );

  // Check if multiple resources are loaded
  const areResourcesLoaded = useCallback(
    (types: ResourceType[]): boolean => {
      return types.every((type) => isResourceLoaded(type));
    },
    [isResourceLoaded]
  );

  // Get loading status
  const getLoadingStatus = useCallback(() => {
    const loadingStates = Object.values(loading);
    const loadingCount = loadingStates.filter(Boolean).length;
    const totalCount = loadingStates.length;
    const loadedCount = Object.values(resources).filter(
      (arr) => arr.length > 0
    ).length;

    return {
      loading: loadingCount > 0,
      loaded: loadedCount,
      total: totalCount,
    };
  }, [loading, resources]);

  // Load specific resources
  const loadResources = useCallback(
    async (
      resourceTypes: ResourceType[],
      forceRefresh = false
    ): Promise<void> => {
      // Don't load resources if user is not logged in
      if (!staff?.id || !staff?.is_logged_in) {
        console.log("⏸️ Skipping resource loading - user not logged in");
        return;
      }

      // Skip if cache is valid and not forcing refresh
      if (
        !forceRefresh &&
        !isCacheExpired() &&
        areResourcesLoaded(resourceTypes)
      ) {
        console.log("Using cached resources for:", resourceTypes);
        return;
      }

      // Filter out already loaded resources (unless forcing refresh)
      const resourcesToLoad = forceRefresh
        ? resourceTypes
        : resourceTypes.filter((type) => !isResourceLoaded(type));

      if (resourcesToLoad.length === 0) {
        console.log("All requested resources already loaded");
        return;
      }

      console.log("Loading resources:", resourcesToLoad);

      // Set loading states
      setLoading((prev) => {
        const newLoading = { ...prev };
        resourcesToLoad.forEach((type) => {
          newLoading[type] = true;
        });
        return newLoading;
      });

      try {
        const startTime = performance.now();

        // Create repository instances and batch requests
        const requests = resourcesToLoad.map((type) => {
          if (type === "services") {
            // Services don't have a real repository, return empty array
            return Promise.resolve({ data: [] as string[] });
          }
          const repoInstance = repositoryMap[type]();
          return addRequest(() => repoInstance.collection(type));
        });

        // Execute all requests in parallel
        const results = await Promise.allSettled(requests);

        // Process results
        const newResources = { ...resources };
        const newLoading = { ...loading };

        results.forEach((result, index) => {
          const resourceType = resourcesToLoad[index];

          if (result.status === "fulfilled") {
            newResources[resourceType] = (result.value.data || []) as any;
            console.log(
              `✅ Loaded ${resourceType}:`,
              result.value.data?.length || 0,
              "items"
            );
          } else {
            console.error(`❌ Failed to load ${resourceType}:`, result.reason);
            newResources[resourceType] = [] as any;
          }

          newLoading[resourceType] = false;
        });

        // Update state
        setResources(newResources);
        setLoading(newLoading);

        // Update cache timestamp
        setCache((prev) => ({
          ...prev,
          timestamp: Date.now(),
        }));

        // Track performance
        const duration = performance.now() - startTime;
        PerformanceTracker.trackApiCall(
          `batch-resources-${resourcesToLoad.join("-")}`,
          duration
        );

        console.log(
          `🚀 Resource loading completed in ${duration.toFixed(2)}ms`
        );
      } catch (error) {
        console.error("Failed to load resources:", error);

        // Reset loading states on error
        setLoading((prev) => {
          const newLoading = { ...prev };
          resourcesToLoad.forEach((type) => {
            newLoading[type] = false;
          });
          return newLoading;
        });
      }
    },
    [
      staff?.id,
      staff?.is_logged_in,
      isCacheExpired,
      areResourcesLoaded,
      isResourceLoaded,
      resources,
      loading,
      repositoryMap,
      addRequest,
    ]
  );

  // Load resources for specific route
  const loadResourcesForRoute = useCallback(
    async (route: string): Promise<void> => {
      // Don't load resources if user is not logged in
      if (!staff?.id || !staff?.is_logged_in) {
        console.log("⏸️ Skipping resource loading - user not logged in");
        return;
      }

      const requiredResources =
        ROUTE_RESOURCE_MAP[route] || ROUTE_RESOURCE_MAP["default"];
      await loadResources(requiredResources);
    },
    [loadResources, staff?.id, staff?.is_logged_in]
  );

  // Get resource data
  const getResource = useCallback(
    (type: ResourceType): ResourceData => {
      return (resources[type] || []) as ResourceData;
    },
    [resources]
  );

  // Get resource by ID
  const getResourceById = useCallback(
    (type: ResourceType, id: number): any => {
      const resourceArray = resources[type] as any[];
      return resourceArray?.find((item: any) => item.id === id);
    },
    [resources]
  );

  // Refresh specific resource
  const refreshResource = useCallback(
    async (type: ResourceType): Promise<void> => {
      await loadResources([type], true);
    },
    [loadResources]
  );

  // Clear cache
  const clearCache = useCallback(() => {
    setResources({
      users: [],
      departments: [],
      funds: [],
      groups: [],
      workflowStages: [],
      documentActions: [],
      services: [],
      carders: [],
      documentTypes: [],
      workflows: [],
      projects: [],
    });

    setCache((prev) => ({
      ...prev,
      timestamp: Date.now(),
    }));

    console.log("🧹 Resource cache cleared");
  }, []);

  // Auto-load resources for current route - ONLY when user is logged in
  useEffect(() => {
    if (staff?.id && staff?.is_logged_in) {
      console.log(
        "🔄 User is logged in, loading resources for route:",
        location.pathname
      );
      loadResourcesForRoute(location.pathname);
    } else {
      console.log("⏸️ User not logged in, skipping resource loading");
    }
  }, [
    location.pathname,
    staff?.id,
    staff?.is_logged_in,
    loadResourcesForRoute,
  ]);

  // Context value
  const contextValue: ResourceContextType = useMemo(
    () => ({
      resources,
      loading,
      cache,
      loadResources,
      loadResourcesForRoute,
      getResource,
      getResourceById,
      clearCache,
      refreshResource,
      isResourceLoaded,
      areResourcesLoaded,
      getLoadingStatus,
    }),
    [
      resources,
      loading,
      cache,
      loadResources,
      loadResourcesForRoute,
      getResource,
      getResourceById,
      clearCache,
      refreshResource,
      isResourceLoaded,
      areResourcesLoaded,
      getLoadingStatus,
    ]
  );

  return (
    <ResourceContext.Provider value={contextValue}>
      {children}
    </ResourceContext.Provider>
  );
};

// Hook to use resource context
export const useResourceContext = (): ResourceContextType => {
  const context = useContext(ResourceContext);
  if (!context) {
    throw new Error("useResourceContext must be used within ResourceProvider");
  }
  return context;
};

// Hook for route-based resource loading
export const useRouteResources = () => {
  const { loadResourcesForRoute, getLoadingStatus } = useResourceContext();
  const location = useLocation();

  useEffect(() => {
    // Only load resources if the route actually changed
    loadResourcesForRoute(location.pathname);
  }, [location.pathname]); // Removed loadResourcesForRoute from dependencies to prevent infinite re-renders

  return {
    loadingStatus: getLoadingStatus(),
  };
};

// Hook for specific resource access
export const useResource = (type: ResourceType) => {
  const { getResource, isResourceLoaded, loading } = useResourceContext();

  return {
    data: getResource(type),
    isLoading: loading[type],
    isLoaded: isResourceLoaded(type),
  };
};

// Hook for multiple resources
export const useResources = (types: ResourceType[]) => {
  const { getResource, areResourcesLoaded, loading, getLoadingStatus } =
    useResourceContext();

  const resources = types.reduce((acc, type) => {
    acc[type] = getResource(type);
    return acc;
  }, {} as Record<ResourceType, ResourceData>);

  return {
    resources,
    isLoading: types.some((type) => loading[type]),
    areLoaded: areResourcesLoaded(types),
    loadingStatus: getLoadingStatus(),
  };
};

export default ResourceContext;
