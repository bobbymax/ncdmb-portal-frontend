import { useModal } from "app/Context/ModalContext";
import { CarderResponseData } from "@/app/Repositories/Carder/data";
import { DepartmentResponseData } from "@/app/Repositories/Department/data";
import {
  CategoryProgressTrackerProps,
  DocumentCategoryResponseData,
} from "@/app/Repositories/DocumentCategory/data";
import { GroupResponseData } from "@/app/Repositories/Group/data";
import { UserResponseData } from "@/app/Repositories/User/data";
import { WorkflowStageResponseData } from "@/app/Repositories/WorkflowStage/data";
import { FormPageComponentProps } from "@/bootstrap";
import React, { useEffect, useMemo, useState, useRef } from "react";
import Button from "resources/views/components/forms/Button";
import FlowConfigModal from "./modals/FlowConfigModal";

const processFlowTypes = ["from", "through", "to"] as const;
export type ProcessFlowType = (typeof processFlowTypes)[number];

export type WorkflowDependencyProps = {
  groups: GroupResponseData[];
  departments: DepartmentResponseData[];
  users: UserResponseData[];
  carders: CarderResponseData[];
  workflowStages: WorkflowStageResponseData[];
};

export type ProcessFlowConfigProps = {
  [key in ProcessFlowType]: CategoryProgressTrackerProps | null;
};

// Extended tracker type with order and flow type
export type TrackerWithOrder = CategoryProgressTrackerProps & {
  order: number;
  flowType: ProcessFlowType;
};

const DocumentWorkflow: React.FC<
  FormPageComponentProps<DocumentCategoryResponseData>
> = ({
  state,
  setState,
  handleChange,
  loading,
  dependencies,
  handleReactSelect,
  mode,
}) => {
  const {
    groups = [],
    departments = [],
    users = [],
    carders = [],
    workflowStages = [],
  } = useMemo(() => dependencies as WorkflowDependencyProps, [dependencies]);

  const { openWorkflow, closeModal } = useModal();
  const isExternalUpdate = useRef(false);

  const [processFlowConfig, setProcessFlowConfig] =
    useState<ProcessFlowConfigProps>({
      from: null,
      through: null,
      to: null,
    });

  // Sync processFlowConfig when state?.config changes (external updates)
  useEffect(() => {
    if (
      state?.config &&
      JSON.stringify(state.config) !== JSON.stringify(processFlowConfig)
    ) {
      isExternalUpdate.current = true;
      setProcessFlowConfig(state.config);
      // Don't reset the ref here - let the next render cycle complete
    } else if (
      !state?.config &&
      (processFlowConfig.from ||
        processFlowConfig.through ||
        processFlowConfig.to)
    ) {
      isExternalUpdate.current = true;
      setProcessFlowConfig({ from: null, through: null, to: null });
      // Don't reset the ref here - let the next render cycle complete
    }
  }, [state?.config]);

  useEffect(() => {
    const orderedTrackers: CategoryProgressTrackerProps[] = [];

    processFlowTypes.forEach((flowType, index) => {
      const config = processFlowConfig[flowType];
      if (config) {
        orderedTrackers.push({
          ...config,
          order: index + 1,
        });
      }
    });

    // Only update parent state if this is NOT an external update
    if (setState && !isExternalUpdate.current) {
      setState((prev) => ({
        ...prev,
        config: processFlowConfig,
        workflow: {
          ...prev.workflow,
          trackers: orderedTrackers,
        },
      }));
    }

    // Reset the external update flag after this effect runs
    if (isExternalUpdate.current) {
      isExternalUpdate.current = false;
    }
  }, [processFlowConfig, setState]);

  const handleProcessFlowConfigChange = (
    type: ProcessFlowType,
    config: CategoryProgressTrackerProps | null,
    mode: "store" | "update"
  ) => {
    isExternalUpdate.current = false; // Mark as internal update
    setProcessFlowConfig((prev) => ({
      ...prev,
      [type]: {
        ...config,
        identifier:
          mode === "store"
            ? "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
                /[xy]/g,
                function (c) {
                  const r = (Math.random() * 16) | 0;
                  const v = c === "x" ? r : (r & 0x3) | 0x8;
                  return v.toString(16);
                }
              )
            : config?.identifier,
      },
    }));
    closeModal();
  };

  // Helper function to get display names from IDs
  const getDisplayName = (
    id: number,
    type: "group" | "department" | "carder" | "workflowStage"
  ) => {
    switch (type) {
      case "group":
        return groups.find((g) => g.id === id)?.name || `Group ${id}`;
      case "department":
        return departments.find((d) => d.id === id)?.abv || `Originating`;
      case "carder":
        return carders.find((c) => c.id === id)?.name || `Carder ${id}`;
      case "workflowStage":
        return workflowStages.find((w) => w.id === id)?.name || `Stage ${id}`;
      default:
        return `ID ${id}`;
    }
  };

  // Helper function to capitalize first letter
  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <div className="row">
      <div className="col-md-12 mb-4">
        <div className="flex align gap-xl center mt-4 mb-4">
          {processFlowTypes.map((type) => {
            const config = processFlowConfig[type];
            return (
              <div key={type} className="process-card">
                {/* Header */}
                <div className="process-card-header mb-3">
                  <h5 className="process-card-title mb-0">
                    {capitalizeFirst(type)}
                  </h5>
                </div>

                {/* Content */}
                <div className="process-card-content mb-4">
                  {config ? (
                    <div className="config-details">
                      <div className="detail-item mb-2">
                        <span className="detail-label">Stage:</span>
                        <span className="detail-value">
                          {getDisplayName(
                            config.workflow_stage_id,
                            "workflowStage"
                          )}
                        </span>
                      </div>
                      <div className="detail-item mb-2">
                        <span className="detail-label">Group:</span>
                        <span className="detail-value">
                          {getDisplayName(config.group_id, "group")}
                        </span>
                      </div>
                      <div className="detail-item mb-2">
                        <span className="detail-label">Department:</span>
                        <span className="detail-value">
                          {getDisplayName(config.department_id, "department")}
                        </span>
                      </div>
                      <div className="detail-item mb-2">
                        <span className="detail-label">Carder:</span>
                        <span className="detail-value">
                          {getDisplayName(config.carder_id, "carder")}
                        </span>
                      </div>
                      {/* <div className="detail-item mb-2">
                        <span className="detail-label">Order:</span>
                        <span className="detail-value">{config.order}</span>
                      </div> */}
                      <div className="detail-item mb-2">
                        <span className="detail-label">Permission:</span>
                        <span className="detail-value">
                          {config.permission}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="no-config">
                      <p>No configuration set</p>
                    </div>
                  )}
                </div>

                {/* Button */}
                <div className="process-card-actions">
                  <Button
                    label={config ? "Edit Configuration" : "Set Configuration"}
                    variant={config ? "info" : "success"}
                    size="sm"
                    fullWidth={true}
                    handleClick={() => {
                      openWorkflow(
                        FlowConfigModal,
                        type,
                        {
                          type,
                          title: `{${capitalizeFirst(
                            type
                          )}} Process Configuration`,
                          modalState: processFlowConfig[type],
                          data: processFlowConfig[type],
                          isUpdating: !!config,
                          handleSubmit: handleProcessFlowConfigChange,
                          dependencies: dependencies as WorkflowDependencyProps,
                        },
                        processFlowConfig[type]
                      );
                    }}
                    icon="ri-equalizer-line"
                    additionalClass="rounded"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DocumentWorkflow;
