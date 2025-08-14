import React, { useContext } from "react";
import { ProcessTabsOption } from "resources/views/crud/ContentBuilder";
import { ConfigState } from "@/app/Hooks/useTemplateHeader";
import { GroupResponseData } from "@/app/Repositories/Group/data";
import { UserResponseData } from "@/app/Repositories/User/data";
import { WorkflowStageResponseData } from "@/app/Repositories/WorkflowStage/data";
import { TemplateProcessProps } from "@/app/Repositories/Template/data";
import ProcessTabBase from "../forms/ProcessTabBase";
import ProcessTabArrayBase from "../forms/ProcessTabArrayBase";
import { useProcessFlow } from "../../../../app/Context/ProcessFlowContext";

type ProcessType = "from" | "to" | "through" | "cc" | "approvers";

interface ProcessFlowContentProps {
  activeTab: ProcessTabsOption;
  dependencies: {
    stages: WorkflowStageResponseData[];
    groups: GroupResponseData[];
    users: UserResponseData[];
  };
  handleStateUpdate: (state: any, key: ProcessType) => void;
  configState: ConfigState;
  isDisplay: boolean;
}

const ProcessFlowContent: React.FC<ProcessFlowContentProps> = ({
  activeTab,
  dependencies,
  handleStateUpdate,
  configState: propConfigState,
  isDisplay,
}) => {
  // Use global context for state management
  const { configState: globalConfigState, getProcessState } = useProcessFlow();

  // Use global state if available, fallback to props
  const configState = globalConfigState || propConfigState;

  // Get the appropriate component for the active tab
  const ActiveComponent = activeTab.TabContent;

  // Get current state for the active tab to ensure persistence
  const currentTabState = configState?.[activeTab.value]?.state;

  // Helper function to get properly typed data for each component
  const getTypedData = (processType: ProcessType) => {
    const state = configState?.[processType]?.state;
    if (processType === "cc" || processType === "approvers") {
      return Array.isArray(state) ? state : [];
    } else {
      return state || null;
    }
  };

  if (!ActiveComponent) {
    return (
      <div className="process__flow__error text-center p-4">
        <p className="text-warning">
          No component available for this process type.
        </p>
      </div>
    );
  }

  // Render the appropriate component based on process type
  if (activeTab.value === "cc" || activeTab.value === "approvers") {
    // Array-based process types
    return (
      <ProcessTabArrayBase
        value={activeTab.value as "cc" | "approvers"}
        icon={activeTab.icon}
        default={activeTab.default}
        data={getTypedData(activeTab.value) as TemplateProcessProps[]} // Pass current state for persistence
        label={activeTab.label}
        handleStateUpdate={handleStateUpdate}
        dependencies={dependencies}
        isDisplay={isDisplay}
        configState={configState}
        buttonLabel={
          activeTab.value === "cc" ? "Add CC Recipient" : "Add Approver"
        }
        emptyMessage={
          activeTab.value === "cc"
            ? "No CC recipients added"
            : "No approvers added"
        }
      />
    );
  } else {
    // Single process types (from, to, through)
    return (
      <ProcessTabBase
        value={activeTab.value as "from" | "to" | "through"}
        icon={activeTab.icon}
        default={activeTab.default}
        data={getTypedData(activeTab.value) as TemplateProcessProps} // Pass current state for persistence
        label={activeTab.label}
        handleStateUpdate={handleStateUpdate}
        dependencies={dependencies}
        isDisplay={isDisplay}
        configState={configState}
      />
    );
  }
};

export default ProcessFlowContent;
