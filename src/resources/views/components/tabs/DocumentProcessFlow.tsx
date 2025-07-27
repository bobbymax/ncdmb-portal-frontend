import { GroupResponseData } from "@/app/Repositories/Group/data";
import { UserResponseData } from "@/app/Repositories/User/data";
import { WorkflowStageResponseData } from "@/app/Repositories/WorkflowStage/data";
import React, { useState } from "react";
import {
  ConfigState,
  ProcessStateMap,
  ProcessTabsOption,
} from "../../crud/ContentBuilder";
import { TemplateProcessProps } from "@/app/Repositories/Template/data";
import useDirectories from "app/Hooks/useDirectories";
import { repo } from "bootstrap/repositories";

type ProcessType = "from" | "to" | "through" | "cc";
interface ProcessFlowProps {
  processTypeOptions: ProcessTabsOption[];
  activeTab: ProcessTabsOption;
  configState: ConfigState;
  setConfigState: (state: ConfigState) => void;
  setActiveTab: (tab: ProcessTabsOption) => void;
}

type ProcessTypeDependencies = {
  stages: WorkflowStageResponseData[];
  groups: GroupResponseData[];
  users: UserResponseData[];
};

const DocumentProcessFlow = ({
  processTypeOptions,
  activeTab,
  setActiveTab,
  configState,
  setConfigState,
}: ProcessFlowProps) => {
  const { collection: stages } = useDirectories(
    repo("workflow_stage"),
    "workflowStages"
  );
  const { collection: groups } = useDirectories(repo("group"), "groups");
  const { collection: staff } = useDirectories(repo("user"), "users");

  return (
    <div className="config__section">
      <h4 className="mb-3">Configuration</h4>

      <div className="config__tab__section">
        <div className="config__tab__header flex align mt-4">
          {processTypeOptions.map((option, idx) => (
            <div
              className={`tab__section__item flex column gap-md align center ${
                activeTab.value === option.value ? "active" : ""
              }`}
              key={idx}
              onClick={() => setActiveTab(option)}
            >
              <img src={option.icon} alt={option.label} />
              <p
                style={{
                  letterSpacing: 1.3,
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                }}
              >
                {option.label}:
              </p>
            </div>
          ))}
        </div>
        <div className="config__tab__content">
          {processTypeOptions.map((option, idx) => {
            const ActiveComponent = option.TabContent;
            return (
              <div
                className="tab__smallest__layer"
                style={{
                  display: activeTab.value === option.value ? "block" : "none",
                }}
                key={idx}
              >
                <ActiveComponent
                  value={activeTab.value}
                  icon={activeTab.icon}
                  label={activeTab.label}
                  default={activeTab.default}
                  data={null}
                  handleStateUpdate={(
                    updatedState: TemplateProcessProps | TemplateProcessProps[],
                    key: ProcessType
                  ) => {
                    const newConfigState: ConfigState = {
                      ...configState,
                      [key]: {
                        key,
                        state: updatedState as ProcessStateMap[typeof key], // TS-safe
                      },
                    };
                    setConfigState(newConfigState);
                  }}
                  dependencies={
                    {
                      stages,
                      groups,
                      users: staff,
                    } as ProcessTypeDependencies
                  }
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DocumentProcessFlow;
