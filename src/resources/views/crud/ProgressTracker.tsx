/* eslint-disable react-hooks/exhaustive-deps */
import { ProgressTrackerResponseData } from "app/Repositories/ProgressTracker/data";
import { WorkflowResponseData } from "app/Repositories/Workflow/data";
import { WorkflowStageResponseData } from "app/Repositories/WorkflowStage/data";
import { FormPageComponentProps } from "bootstrap";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import MultiSelect, { DataOptionsProps } from "../components/forms/MultiSelect";
import { ActionMeta } from "react-select";
import { formatOptions } from "app/Support/Helpers";
import { DocumentTypeResponseData } from "app/Repositories/DocumentType/data";
import { DocumentActionResponseData } from "app/Repositories/DocumentAction/data";
import { MailingListResponseData } from "app/Repositories/MailingList/data";
import Alert from "app/Support/Alert";
import StageCapsule from "../components/capsules/StageCapsule";
import FlowchartCapsules from "../components/capsules/FlowchartCapsules";
import { useModal } from "app/Context/ModalContext";
import TrackerModal from "./modals/TrackerModal";
interface DependencyProps {
  workflows: WorkflowResponseData[];
  stages: WorkflowStageResponseData[];
  documentTypes: DocumentTypeResponseData[];
  documentActions: DocumentActionResponseData[];
  mailingLists: MailingListResponseData[];
}
export interface ServerTrackersRequestProps
  extends Partial<WorkflowStageResponseData> {
  id: number;
  workflow_stage_id: number;
  fallback_to_stage_id: number;
  return_to_stage_id: number;
  document_type_id: number;
  order: number;
  actions: DataOptionsProps[];
  recipients: DataOptionsProps[];
  icon_path: string;
  stage_category_name: string;
}

const ProgressTracker: React.FC<
  FormPageComponentProps<ProgressTrackerResponseData>
> = ({ state, handleReactSelect, dependencies, setState, loading }) => {
  const { openModal, closeModal } = useModal();
  const [workflows, setWorkflows] = useState<DataOptionsProps[]>([]);
  const [stages, setStages] = useState<WorkflowStageResponseData[]>([]);
  const [actions, setActions] = useState<DataOptionsProps[]>([]);
  const [recipients, setRecipients] = useState<DataOptionsProps[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DataOptionsProps[]>([]);

  const [processes, setProcesses] = useState<ServerTrackersRequestProps[]>([]);
  const backendUrl = useMemo(() => "https://portal.test", []);

  const [selectedOptions, setSelectedOptions] = useState<{
    workflow: DataOptionsProps | null;
  }>({
    workflow: null,
  });

  const handleSelectionChange = useCallback(
    (key: "workflow_stage" | "workflow") =>
      (newValue: unknown, actionMeta: ActionMeta<unknown>) => {
        handleReactSelect(newValue, actionMeta, (value) => {
          const updatedValue = value as DataOptionsProps;
          setSelectedOptions((prev) => ({ ...prev, [key]: updatedValue }));
          if (setState) {
            setState((prev) => ({
              ...prev,
              [`${key}_id`]: updatedValue?.value ?? 0,
            }));
          }
        });
      },
    [handleReactSelect, setState]
  );

  const handleFlowchartBoard = (stage: WorkflowStageResponseData) => {
    const position = processes.length + 1;
    const process: ServerTrackersRequestProps = {
      id: processes.length + 1,
      workflow_stage_id: stage.id,
      fallback_to_stage_id: 0,
      return_to_stage_id: 0,
      document_type_id: 0,
      actions: [],
      recipients: [],
      order: position,
      name: stage.name,
      status: stage.status,
      icon_path: stage.stage_category?.icon_path ?? "",
      stage_category_name: stage.stage_category?.name ?? "",
    };

    Alert.flash(
      "Add to Flowchart!!",
      "info",
      "You are adding this stage to the flowchart!!"
    ).then((result) => {
      if (result.isConfirmed) {
        setProcesses((prev) =>
          [...prev, process].sort((a, b) => a.order - b.order)
        );
      }
    });
  };

  // console.log(processes);

  const onSubmit = (
    response: object | string,
    mode: "store" | "update" | "destroy" | "generate"
  ) => {
    if (mode === "update") {
      const trackerResponse = response as ServerTrackersRequestProps;

      setProcesses(
        processes.map((process) => {
          if (process.id === trackerResponse.id) {
            return trackerResponse;
          }

          return process;
        })
      );
    } else if (mode === "destroy") {
      Alert.flash(
        "Are you Sure?",
        "warning",
        "You will not be able to reverse this!!"
      ).then(async (result) => {
        if (result.isConfirmed) {
          console.log(response);
        }
      });
    }

    closeModal();
  };

  // Manages the Tracker Modal
  const move = (
    process: ServerTrackersRequestProps,
    currentPosition: number,
    action: "up" | "down"
  ) => {
    if (action === "up" && currentPosition <= 1) return;
    if (action === "down" && currentPosition >= processes.length) return;

    const newPosition =
      action === "up" ? currentPosition - 1 : currentPosition + 1;
    const affectedProcess = processes.find((p) => p.order === newPosition);
    if (!affectedProcess) return;

    const updatedProcesses = processes.map((p) =>
      p.id === process.id
        ? { ...p, order: newPosition }
        : p.id === affectedProcess.id
        ? { ...p, order: currentPosition }
        : p
    );

    setProcesses(updatedProcesses.sort((a, b) => a.order - b.order));
  };

  const manage = (process: ServerTrackersRequestProps) => {
    openModal(TrackerModal, "tracker", {
      title: `Manage ${process.name} Tracker`,
      isUpdating: true,
      onSubmit,
      data: process,
      dependencies: [stages, documentTypes, actions, recipients],
    });
  };

  useEffect(() => {
    if (dependencies) {
      const {
        workflows = [],
        stages = [],
        documentActions = [],
        documentTypes = [],
        mailingLists = [],
      } = dependencies as DependencyProps;

      setWorkflows(formatOptions(workflows, "id", "name"));
      setStages(stages);
      setActions(formatOptions(documentActions, "id", "name"));
      setRecipients(formatOptions(mailingLists, "id", "name"));
      setDocumentTypes(formatOptions(documentTypes, "id", "name"));
    }
  }, [dependencies]);

  useEffect(() => {
    if (setState && processes.length > 0) {
      setState((prev) => ({
        ...prev,
        stages: processes,
      }));
    }
  }, [processes, setState]);

  const renderMultiSelect = (
    label: string,
    options: DataOptionsProps[],
    value: DataOptionsProps | DataOptionsProps[] | null,
    onChange: (newValue: unknown, actionMeta: ActionMeta<unknown>) => void,
    placeholder: string,
    grid: number = 4
  ) => (
    <div className={`col-md-${grid} mb-3`}>
      <MultiSelect
        label={label}
        options={options}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        isSearchable
        isDisabled={loading}
      />
    </div>
  );

  return (
    <>
      {renderMultiSelect(
        "Workflow",
        workflows,
        selectedOptions.workflow,
        handleSelectionChange("workflow"),
        "Workflow",
        3
      )}

      <div className="tracker__container">
        <div className="row">
          <div className="col-md-6">
            <div className="workflow_stages_section">
              <div className="row">
                {stages.map((stage) => (
                  <div className="col-md-4 mb-3" key={stage.id}>
                    <StageCapsule
                      workflow_id={state.workflow_id}
                      url={backendUrl}
                      stage={stage}
                      handleFlowchartBoard={handleFlowchartBoard}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="workflow_section custom-card">
              <div className="workflow_section_header mb-4">
                <small>Workflow:</small>
                <h3>{selectedOptions.workflow?.label ?? "Not Set"}</h3>
              </div>

              <FlowchartCapsules
                processes={processes}
                manageCapsule={manage}
                move={move}
                stages={stages}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProgressTracker;
