import { usePaperBoard } from "app/Context/PaperBoardContext";
import { ResourceProps } from "app/Context/PaperBoardContext";

/**
 * Custom hook to easily access PaperBoard resources
 * This replaces individual useCachedDirectories calls with centralized resource access
 */
export const usePaperBoardResources = () => {
  const { state, actions } = usePaperBoard();

  return {
    // Resource data with fallbacks for undefined values
    departments: state.resources?.departments || [],
    users: state.resources?.users || [],
    groups: state.resources?.groups || [],
    funds: state.resources?.funds || [],
    workflowStages: state.resources?.workflowStages || [],
    documentActions: state.resources?.documentActions || [],
    services: state.resources?.services || [],
    carders: state.resources?.carders || [],
    documentTypes: state.resources?.documentTypes || [],
    workflows: state.resources?.workflows || [],
    projects: state.resources?.projects || [],

    // Loading and error states
    isLoading: state.isLoading,
    hasError: state.hasError,
    errorMessage: state.errorMessage,

    // Helper functions
    getResourceData: actions.getResourceData,
    loadAllResources: actions.loadAllResources,
    areResourcesLoaded: actions.areResourcesLoaded,

    // Convenience methods
    getDepartmentById: (id: number) =>
      state.resources?.departments?.find((dept) => dept.id === id),
    getUserById: (id: number) =>
      state.resources?.users?.find((user) => user.id === id),
    getFundById: (id: number) =>
      state.resources?.funds?.find((fund) => fund.id === id),
    getGroupById: (id: number) =>
      state.resources?.groups?.find((group) => group.id === id),
  };
};

export default usePaperBoardResources;
