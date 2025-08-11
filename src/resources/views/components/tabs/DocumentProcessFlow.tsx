import { GroupResponseData } from "@/app/Repositories/Group/data";
import { UserResponseData } from "@/app/Repositories/User/data";
import { WorkflowStageResponseData } from "@/app/Repositories/WorkflowStage/data";
import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
  useEffect,
} from "react";
import { ProcessTabsOption } from "resources/views/crud/ContentBuilder";
import { TemplateProcessProps } from "@/app/Repositories/Template/data";
import { repo } from "bootstrap/repositories";
import { ConfigState, ProcessStateMap } from "@/app/Hooks/useTemplateHeader";
import { useAuth } from "app/Context/AuthContext";
import { useAccessControl } from "app/Hooks/useAccessControl";

type ProcessType = "from" | "to" | "through" | "cc" | "approvers";
interface ProcessFlowProps {
  processTypeOptions: ProcessTabsOption[];
  activeTab: ProcessTabsOption;
  configState: ConfigState;
  setConfigState: (state: ConfigState) => void;
  setActiveTab: (tab: ProcessTabsOption) => void;
  isDisplay?: boolean;
}

type ProcessTypeDependencies = {
  stages: WorkflowStageResponseData[];
  groups: GroupResponseData[];
  users: UserResponseData[];
};

// Custom hook to prevent infinite re-renders
const useStableDirectories = () => {
  const [data, setData] = useState({
    stages: [] as WorkflowStageResponseData[],
    groups: [] as GroupResponseData[],
    users: [] as UserResponseData[],
    loading: true,
    error: null as string | null,
  });

  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;

    const fetchData = async () => {
      try {
        setData((prev) => ({ ...prev, loading: true, error: null }));

        const workflowStageRepo = repo("workflow_stage");
        const groupRepo = repo("group");
        const userRepo = repo("user");

        const [stagesResponse, groupsResponse, usersResponse] =
          await Promise.all([
            workflowStageRepo.collection("workflowStages"),
            groupRepo.collection("groups"),
            userRepo.collection("users"),
          ]);

        setData({
          stages: (stagesResponse.data as WorkflowStageResponseData[]) || [],
          groups: (groupsResponse.data as GroupResponseData[]) || [],
          users: (usersResponse.data as UserResponseData[]) || [],
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error("Error fetching directories:", error);
        setData((prev) => ({
          ...prev,
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to load process configuration",
        }));
      }
    };

    fetchData();
    initialized.current = true;
  }, []);

  return data;
};

const DocumentProcessFlow = ({
  processTypeOptions,
  activeTab,
  setActiveTab,
  configState,
  setConfigState,
  isDisplay = false,
}: ProcessFlowProps) => {
  const { stages, groups, users, loading, error } = useStableDirectories();

  // const { filteredResources } = useAccessControl(users);

  // Check if all dependencies are loaded
  const hasData = stages.length > 0 && groups.length > 0 && users.length > 0;

  // Validate required props
  if (
    !processTypeOptions ||
    !Array.isArray(processTypeOptions) ||
    processTypeOptions.length === 0
  ) {
    return (
      <div className="process__flow__section">
        <h5 className="process__flow__title mb-3">Document Process Flow</h5>
        <div className="process__flow__error text-center p-4">
          <p className="process__flow__error__text text-warning">
            No process type options available.
          </p>
        </div>
      </div>
    );
  }

  if (!activeTab || !setActiveTab || !configState || !setConfigState) {
    return (
      <div className="process__flow__section">
        <h5 className="process__flow__title mb-3">Document Process Flow</h5>
        <div className="process__flow__error text-center p-4">
          <p className="process__flow__error__text text-warning">
            Missing required configuration.
          </p>
        </div>
      </div>
    );
  }

  // Use ref to track current configState to avoid infinite loops
  const configStateRef = useRef(configState);

  // Update ref when configState changes - use a stable reference
  useEffect(() => {
    configStateRef.current = configState;
  }, [configState]); // Keep this dependency but ensure handleStateUpdate doesn't cause loops

  // Create a stable handleStateUpdate function that doesn't depend on changing values
  const handleStateUpdate = useCallback(
    (
      updatedState: TemplateProcessProps | TemplateProcessProps[],
      key: ProcessType
    ) => {
      try {
        const newConfigState: ConfigState = {
          ...configStateRef.current,
          [key]: {
            key,
            state: updatedState as ProcessStateMap[typeof key], // TS-safe
          },
        };
        setConfigState(newConfigState);
      } catch (error) {
        console.error("Error updating config state:", error);
      }
    },
    [setConfigState] // Include setConfigState dependency
  );

  // Memoize the dependencies to prevent unnecessary re-renders
  const dependencies = useMemo(
    () =>
      ({
        stages: stages.filter(
          (stage) => stage.flow === "process" || stage.flow === "both"
        ),
        groups,
        users,
      } as ProcessTypeDependencies),
    [stages, groups, users]
  );

  // Filter tabs when in display mode - only show tabs with actual state values
  const filteredProcessTypeOptions = useMemo(() => {
    if (!isDisplay) {
      return processTypeOptions;
    }

    return processTypeOptions.filter((option) => {
      const configData = configStateRef.current[option.value]; // Use ref for consistency

      if (!configData?.state) {
        return false;
      }

      // For single process types (from, to, through)
      if (
        option.value === "from" ||
        option.value === "to" ||
        option.value === "through"
      ) {
        const state = configData.state as TemplateProcessProps;
        return state.stage?.value || state.group?.value || state.staff?.value;
      }

      // For array process types (cc, approvers)
      if (option.value === "cc" || option.value === "approvers") {
        const state = configData.state as TemplateProcessProps[];
        return Array.isArray(state) && state.length > 0;
      }

      return false;
    });
  }, [processTypeOptions, isDisplay]); // Remove configState dependency

  // Update active tab if current tab is filtered out
  useEffect(() => {
    if (isDisplay && filteredProcessTypeOptions.length > 0) {
      const currentTabExists = filteredProcessTypeOptions.some(
        (option) => option.value === activeTab.value
      );

      if (!currentTabExists) {
        setActiveTab(filteredProcessTypeOptions[0]);
      }
    }
  }, [filteredProcessTypeOptions, activeTab, isDisplay, setActiveTab]);

  // Ensure active tab is always valid even in non-display mode
  useEffect(() => {
    if (!isDisplay && processTypeOptions.length > 0) {
      const currentTabExists = processTypeOptions.some(
        (option) => option.value === activeTab.value
      );

      if (!currentTabExists) {
        setActiveTab(processTypeOptions[0]);
      }
    }
  }, [processTypeOptions, activeTab, isDisplay, setActiveTab]);

  // Show loading state if data is not ready
  if (loading || !hasData) {
    return (
      <div className="process__flow__section">
        <h5 className="process__flow__title mb-3">Document Process Flow</h5>
        <div className="process__flow__loading text-center p-4">
          <div className="spinner-border" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="process__flow__loading__text mt-2">
            Loading process configuration...
          </p>
        </div>
      </div>
    );
  }

  // Show error state if there was an error loading data
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

  // Show message when no tabs are available in display mode
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
          {filteredProcessTypeOptions.map((option, idx) => {
            const ActiveComponent = option.TabContent;
            return (
              <div
                className="process__flow__tab__layer"
                style={{
                  display: activeTab.value === option.value ? "block" : "none",
                }}
                key={idx}
                role="tabpanel"
                aria-hidden={activeTab.value !== option.value}
                aria-label={`${option.label} content`}
              >
                <ActiveComponent
                  key={`${option.value}-${activeTab.value}`}
                  value={activeTab.value}
                  icon={activeTab.icon}
                  label={activeTab.label}
                  default={activeTab.default}
                  data={null}
                  configState={configState}
                  handleStateUpdate={handleStateUpdate}
                  dependencies={dependencies}
                  isDisplay={isDisplay}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default React.memo(DocumentProcessFlow);
