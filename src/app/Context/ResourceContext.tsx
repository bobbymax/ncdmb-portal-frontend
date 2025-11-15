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
import { RoleResponseData } from "../Repositories/Role/data";
import { WorkflowStageResponseData } from "../Repositories/WorkflowStage/data";
import { DocumentActionResponseData } from "../Repositories/DocumentAction/data";
import { CarderResponseData } from "../Repositories/Carder/data";
import { DocumentTypeResponseData } from "../Repositories/DocumentType/data";
import { WorkflowResponseData } from "../Repositories/Workflow/data";
import { JournalTypeResponseData } from "../Repositories/JournalType/data";
import { DocumentPanelResponseData } from "../Repositories/DocumentPanel/data";
import { ExpenditureResponseData } from "../Repositories/Expenditure/data";
import { ThresholdResponseData } from "../Repositories/Threshold/data";

// Resource types mapping
export type ResourceType =
  | "users"
  | "departments"
  | "funds"
  | "groups"
  | "roles"
  | "workflowStages"
  | "documentActions"
  | "services"
  | "carders"
  | "documentTypes"
  | "workflows"
  | "projects"
  | "journalTypes"
  | "documentPanels"
  | "expenditures"
  | "thresholds";

export type ResourceData =
  | UserResponseData[]
  | DepartmentResponseData[]
  | FundResponseData[]
  | GroupResponseData[]
  | RoleResponseData[]
  | WorkflowStageResponseData[]
  | DocumentActionResponseData[]
  | string[]
  | CarderResponseData[]
  | DocumentTypeResponseData[]
  | WorkflowResponseData[]
  | JournalTypeResponseData[]
  | DocumentPanelResponseData[]
  | ExpenditureResponseData[]
  | ThresholdResponseData[]
  | any[];

// Resource map interface
export interface ResourceMap {
  users: UserResponseData[];
  departments: DepartmentResponseData[];
  funds: FundResponseData[];
  groups: GroupResponseData[];
  roles: RoleResponseData[];
  workflowStages: WorkflowStageResponseData[];
  documentActions: DocumentActionResponseData[];
  services: string[];
  carders: CarderResponseData[];
  documentTypes: DocumentTypeResponseData[];
  workflows: WorkflowResponseData[];
  projects: any[];
  journalTypes: JournalTypeResponseData[];
  documentPanels: DocumentPanelResponseData[];
  expenditures: ExpenditureResponseData[];
  thresholds: ThresholdResponseData[];
}

// Loading states interface
export interface LoadingMap {
  users: boolean;
  departments: boolean;
  funds: boolean;
  groups: boolean;
  roles: boolean;
  workflowStages: boolean;
  documentActions: boolean;
  services: boolean;
  carders: boolean;
  documentTypes: boolean;
  workflows: boolean;
  projects: boolean;
  journalTypes: boolean;
  documentPanels: boolean;
  expenditures: boolean;
  thresholds: boolean;
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
  // Only load resources for document routes
  "/desk/folders/category/:id/*": [
    "departments",
    "users",
    "funds",
    "groups",
    "roles",
    "workflowStages",
    "documentActions",
    "carders",
    "documentTypes",
    "workflows",
    "journalTypes",
    "documentPanels",
    "thresholds",
  ],
  "/performance": ["funds", "expenditures"],

  // Default fallback - no resources loaded for other routes
  default: [],
};

// Helper function to match route patterns
const matchRoutePattern = (route: string, pattern: string): boolean => {
  // Convert pattern to regex
  const regexPattern = pattern
    .replace(/\//g, "\\/") // Escape forward slashes
    .replace(/:id/g, "\\d+") // Match :id with digits
    .replace(/\*/g, ".*"); // Match * with any characters

  const regex = new RegExp(`^${regexPattern}`);
  return regex.test(route);
};

// Helper function to get resources for a route
const getResourcesForRoute = (route: string): ResourceType[] => {
  // Check for exact matches first
  if (ROUTE_RESOURCE_MAP[route]) {
    return ROUTE_RESOURCE_MAP[route];
  }

  // Check for pattern matches
  for (const [pattern, resources] of Object.entries(ROUTE_RESOURCE_MAP)) {
    if (pattern !== "default" && matchRoutePattern(route, pattern)) {
      return resources;
    }
  }

  // Return default resources
  return ROUTE_RESOURCE_MAP["default"];
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
    roles: [],
    workflowStages: [],
    documentActions: [],
    services: [],
    carders: [],
    documentTypes: [],
    workflows: [],
    projects: [],
    journalTypes: [],
    documentPanels: [],
    expenditures: [],
    thresholds: [],
  });

  const [loading, setLoading] = useState<LoadingMap>({
    users: false,
    departments: false,
    funds: false,
    groups: false,
    roles: false,
    workflowStages: false,
    documentActions: false,
    services: false,
    carders: false,
    documentTypes: false,
    workflows: false,
    projects: false,
    journalTypes: false,
    documentPanels: false,
    expenditures: false,
    thresholds: false,
  });

  // Cache management
  const [cache, setCache] = useState<CacheInfo>({
    timestamp: Date.now(),
    ttl: ENV.CACHE_TTL, // 5 minutes default
    sessionId: staff?.id?.toString() || null,
  });

  // Update cache when user changes and clear resources when user logs out
  useEffect(() => {
    if (staff?.id) {
      // User is logged in - update cache
      setCache((prev) => ({
        ...prev,
        sessionId: staff.id.toString(),
        timestamp: Date.now(),
      }));
    } else {
      // User is not logged in - clear resources and cache
      setResources({
        users: [],
        departments: [],
        funds: [],
        groups: [],
        roles: [],
        workflowStages: [],
        documentActions: [],
        services: [],
        carders: [],
        documentTypes: [],
        workflows: [],
        projects: [],
        journalTypes: [],
        documentPanels: [],
        expenditures: [],
        thresholds: [],
      });
      setCache((prev) => ({
        ...prev,
        sessionId: null,
        timestamp: Date.now(),
      }));
    }
  }, [staff?.id]);

  // Repository mapping
  const repositoryMap = useMemo(
    () => ({
      users: () => repo("user"),
      departments: () => repo("department"),
      funds: () => repo("fund"),
      groups: () => repo("group"),
      roles: () => repo("role"),
      workflowStages: () => repo("workflowStage"),
      documentActions: () => repo("documentAction"),
      carders: () => repo("carder"),
      documentTypes: () => repo("documentType"),
      workflows: () => repo("workflow"),
      projects: () => repo("project"),
      journalTypes: () => repo("journalType"),
      documentPanels: () => repo("documentPanel"),
      expenditures: () => repo("expenditure"),
      thresholds: () => repo("threshold"),
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
      if (!staff?.id) {
        return;
      }

      // Skip if no resources to load
      if (resourceTypes.length === 0) {
        return;
      }

      // Skip if cache is valid and not forcing refresh
      if (
        !forceRefresh &&
        !isCacheExpired() &&
        areResourcesLoaded(resourceTypes)
      ) {
        return;
      }

      // Filter out already loaded resources (unless forcing refresh)
      const resourcesToLoad = forceRefresh
        ? resourceTypes
        : resourceTypes.filter((type) => !isResourceLoaded(type));

      if (resourcesToLoad.length === 0) {
        return;
      }

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
      if (!staff?.id) {
        return;
      }

      const requiredResources = getResourcesForRoute(route);

      await loadResources(requiredResources);
    },
    [loadResources, staff?.id]
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
      roles: [],
      workflowStages: [],
      documentActions: [],
      services: [],
      carders: [],
      documentTypes: [],
      workflows: [],
      projects: [],
      journalTypes: [],
      documentPanels: [],
      expenditures: [],
      thresholds: [],
    });

    setCache((prev) => ({
      ...prev,
      timestamp: Date.now(),
    }));
  }, []);

  // Auto-load resources for current route - ONLY when user is logged in
  useEffect(() => {
    if (staff?.id) {
      loadResourcesForRoute(location.pathname);
    }
  }, [location.pathname, staff?.id]);

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
