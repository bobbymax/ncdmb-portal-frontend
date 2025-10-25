import { useResourceContext, useResources } from "app/Context/ResourceContext";
import { usePaperBoard } from "app/Context/PaperBoardContext";

/**
 * Custom hook to easily access PaperBoard resources
 * This now uses ResourceContext for centralized resource management
 */
export const usePaperBoardResources = () => {
  const {
    resources,
    loading,
    getResourceById,
    isResourceLoaded,
    areResourcesLoaded,
    getLoadingStatus,
  } = useResourceContext();

  const { state } = usePaperBoard();

  return {
    // Resource data with fallbacks for undefined values
    departments: resources.departments || [],
    users: resources.users || [],
    groups: resources.groups || [],
    funds: resources.funds || [],
    workflowStages: resources.workflowStages || [],
    documentActions: resources.documentActions || [],
    services: resources.services || [],
    carders: resources.carders || [],
    documentTypes: resources.documentTypes || [],
    workflows: resources.workflows || [],
    projects: resources.projects || [],
    documentPanels: resources.documentPanels || [],

    // Loading and error states from PaperBoard
    isLoading: state.isLoading,
    hasError: state.hasError,
    errorMessage: state.errorMessage,

    // Resource-specific loading states
    resourceLoading: loading,
    loadingStatus: getLoadingStatus(),

    // Helper functions
    getResourceData: (resourceType: keyof typeof resources) =>
      resources[resourceType] || [],
    areResourcesLoaded: () =>
      areResourcesLoaded(["departments", "users", "groups", "funds"]),

    // Convenience methods using ResourceContext
    getDepartmentById: (id: number) => getResourceById("departments", id),
    getUserById: (id: number) => getResourceById("users", id),
    getFundById: (id: number) => getResourceById("funds", id),
    getGroupById: (id: number) => getResourceById("groups", id),
    getWorkflowStageById: (id: number) => getResourceById("workflowStages", id),
    getDocumentActionById: (id: number) =>
      getResourceById("documentActions", id),
    getCarderById: (id: number) => getResourceById("carders", id),
    getDocumentTypeById: (id: number) => getResourceById("documentTypes", id),
    getWorkflowById: (id: number) => getResourceById("workflows", id),
    getDocumentPanelById: (id: number) => getResourceById("documentPanels", id),
  };
};

export default usePaperBoardResources;
