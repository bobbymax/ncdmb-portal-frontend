import React, { useState, useEffect, useMemo, useContext } from "react";
import { ProcessTabsOption } from "resources/views/crud/ContentBuilder";
import { ConfigState, ProcessStateMap } from "@/app/Hooks/useTemplateHeader";
import { GroupResponseData } from "@/app/Repositories/Group/data";
import { UserResponseData } from "@/app/Repositories/User/data";
import { WorkflowStageResponseData } from "@/app/Repositories/WorkflowStage/data";
import { repo } from "bootstrap/repositories";
import ProcessFlowContent from "./ProcessFlowContent";
import { useProcessFlow } from "../../../../app/Context/ProcessFlowContext";

type ProcessType = "from" | "to" | "through" | "cc" | "approvers";

interface BaseProcessFlowProps {
  processTypeOptions: ProcessTabsOption[];
  activeTab: ProcessTabsOption;
  configState: ConfigState;
  setConfigState: (state: ConfigState) => void;
  setActiveTab: (tab: ProcessTabsOption) => void;
  isDisplay?: boolean;
  onStateUpdate?: (key: ProcessType, state: any) => void;
}

type ProcessTypeDependencies = {
  stages: WorkflowStageResponseData[];
  groups: GroupResponseData[];
  users: UserResponseData[];
};

const BaseProcessFlow: React.FC<BaseProcessFlowProps> = ({
  processTypeOptions,
  activeTab,
  configState: propConfigState,
  setConfigState: propSetConfigState,
  setActiveTab,
  isDisplay = false,
  onStateUpdate,
}) => {
  // Use global context for state management
  const {
    configState: globalConfigState,
    updateProcessState: globalUpdateProcessState,
    hasProcessData,
  } = useProcessFlow();

  // Use global state if available, fallback to props
  const configState = globalConfigState || propConfigState;
  const setConfigState = propSetConfigState || globalUpdateProcessState;

  const [dependencies, setDependencies] = useState<ProcessTypeDependencies>({
    stages: [],
    groups: [],
    users: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Smart data fetching with caching and persistence
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check if we have cached data first
        const cached = sessionStorage.getItem("processFlowDependencies");
        if (cached) {
          const parsed = JSON.parse(cached);
          setDependencies(parsed);
          setIsLoading(false);
          return;
        }

        setIsLoading(true);

        const workflowStageRepo = repo("workflow_stage");
        const groupRepo = repo("group");
        const userRepo = repo("user");

        const [stagesResponse, groupsResponse, usersResponse] =
          await Promise.all([
            workflowStageRepo.collection("workflowStages"),
            groupRepo.collection("groups"),
            userRepo.collection("users"),
          ]);

        const newDependencies = {
          stages: (stagesResponse.data as WorkflowStageResponseData[]) || [],
          groups: (groupsResponse.data as GroupResponseData[]) || [],
          users: (usersResponse.data as UserResponseData[]) || [],
        };

        // Cache the data for future use
        sessionStorage.setItem(
          "processFlowDependencies",
          JSON.stringify(newDependencies)
        );
        setDependencies(newDependencies);
        setError(null);
      } catch (error) {
        console.error("Error fetching process flow dependencies:", error);
        setError("Failed to load process configuration");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter process type options based on display mode and context
  const filteredProcessTypeOptions = useMemo(() => {
    if (!isDisplay) {
      return processTypeOptions;
    }

    if (!configState) {
      return processTypeOptions;
    }

    // In DocumentGenerator context (when onStateUpdate exists), be more restrictive
    // Only show tabs that have meaningful data from the database
    const isDocumentGeneratorContext = !!onStateUpdate;

    return processTypeOptions.filter((option) => {
      if (isDocumentGeneratorContext) {
        // In DocumentGenerator: only show tabs with meaningful data
        return hasProcessData(option.value);
      }

      // In ContentBuilder: show all tabs
      return true;
    });
  }, [
    processTypeOptions,
    isDisplay,
    configState,
    onStateUpdate,
    hasProcessData,
  ]);

  // Handle active tab updates
  useEffect(() => {
    if (filteredProcessTypeOptions.length > 0) {
      const currentTabExists = filteredProcessTypeOptions.some(
        (option) => option.value === activeTab.value
      );

      if (!currentTabExists) {
        setActiveTab(filteredProcessTypeOptions[0]);
      }
    }
  }, [filteredProcessTypeOptions, activeTab.value, setActiveTab]);

  //   console.log(onStateUpdate);

  // Handle state updates with proper synchronization
  const handleStateUpdate = (updatedState: any, key: ProcessType) => {
    try {
      // Always update global state first
      globalUpdateProcessState(key, updatedState);

      // Also call parent callback if provided (DocumentGenerator context)
      if (onStateUpdate) {
        onStateUpdate(updatedState, key);
      }
    } catch (error) {
      console.error("Error updating process state:", error);
    }
  };

  // Sync local state with global state when configState changes
  useEffect(() => {
    if (configState && Object.keys(configState).length > 0) {
      // Update dependencies if they're missing but we have configState
      if (
        dependencies.stages.length === 0 &&
        dependencies.groups.length === 0 &&
        dependencies.users.length === 0
      ) {
        const cached = sessionStorage.getItem("processFlowDependencies");
        if (cached) {
          const parsed = JSON.parse(cached);
          setDependencies(parsed);
        }
      }
    }
  }, [
    configState,
    dependencies.stages.length,
    dependencies.groups.length,
    dependencies.users.length,
  ]);

  // Show error state
  if (error) {
    return (
      <div className="process__flow__section">
        <h5 className="process__flow__title mb-3">Document Process Flow</h5>
        <div className="process__flow__error text-center p-4">
          <div className="process__flow__error__icon mb-2">
            <i
              className="ri-error-warning-line text-danger"
              style={{ fontSize: "2rem" }}
            ></i>
          </div>
          <p className="process__flow__error__text text-danger mb-2">{error}</p>
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={() => window.location.reload()}
          >
            <i className="ri-refresh-line me-1"></i>
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show loading state only if we have no cached data
  if (isLoading && dependencies.stages.length === 0) {
    return (
      <div className="process__flow__section">
        <h5 className="process__flow__title mb-3">Document Process Flow</h5>
        <div className="text-center p-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading process configuration...</p>
        </div>
      </div>
    );
  }

  // Show empty state for display mode
  if (isDisplay && filteredProcessTypeOptions.length === 0) {
    return (
      <div className="process__flow__section">
        <h5 className="process__flow__title mb-3">Document Process Flow</h5>
        <div className="process__flow__empty text-center p-4">
          <p className="process__flow__empty__text">
            No process configuration available for display.
          </p>
        </div>
      </div>
    );
  }

  // Render the main content
  return (
    <div className="process__flow__section">
      <h5 className="process__flow__title mb-3">Document Process Flow</h5>

      <div className="process__flow__tabs">
        <div className="process__flow__tab__header flex align mt-4">
          {filteredProcessTypeOptions.map((option, idx) => (
            <div
              className={`process__flow__tab__item flex column gap-md align center ${
                activeTab.value === option.value ? "active" : ""
              }`}
              key={idx}
              onClick={() => setActiveTab(option)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setActiveTab(option);
                }
              }}
              role="tab"
              tabIndex={0}
              aria-selected={activeTab.value === option.value}
              aria-label={`${option.label} tab`}
            >
              <img src={option.icon} alt={option.label} />
              <p className="process__flow__tab__label">{option.label}:</p>
            </div>
          ))}
        </div>

        <div
          className="process__flow__tab__content"
          role="tabpanel"
          aria-label="Process flow content"
        >
          <ProcessFlowContent
            activeTab={activeTab}
            dependencies={dependencies}
            handleStateUpdate={handleStateUpdate}
            configState={configState}
            isDisplay={isDisplay}
          />
        </div>
      </div>
    </div>
  );
};

export default BaseProcessFlow;
