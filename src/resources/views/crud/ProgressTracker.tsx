import {
  ProgressTrackerResponseData,
  ServerTrackerData,
} from "app/Repositories/ProgressTracker/data";
import { WorkflowResponseData } from "app/Repositories/Workflow/data";
import { WorkflowStageResponseData } from "app/Repositories/WorkflowStage/data";
import { FormPageComponentProps } from "bootstrap";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import MultiSelect, { DataOptionsProps } from "../components/forms/MultiSelect";
import { ActionMeta } from "react-select";
import { formatOptions, generateUniqueString } from "app/Support/Helpers";
import { DocumentTypeResponseData } from "app/Repositories/DocumentType/data";
import { useModal } from "app/Context/ModalContext";
import { CarderResponseData } from "app/Repositories/Carder/data";
import { DepartmentResponseData } from "app/Repositories/Department/data";
import WorkflowStageRepository from "app/Repositories/WorkflowStage/WorkflowStageRepository";
import Button from "../components/forms/Button";
import CardButton from "../components/forms/CardButton";
import TrackerModal from "./modals/TrackerModal";
import Alert from "app/Support/Alert";
import { useParams } from "react-router-dom";
import _ from "lodash";
import { repo } from "bootstrap/repositories";
import { SignatoryResponseData } from "app/Repositories/Signatory/data";
import { WidgetResponseData } from "app/Repositories/Widget/data";
import { ProcessCardResponseData } from "@/app/Repositories/ProcessCard/data";

interface DependencyProps {
  workflows: WorkflowResponseData[];
  stages: WorkflowStageResponseData[];
  documentTypes: DocumentTypeResponseData[];
  carders: CarderResponseData[];
  departments: DepartmentResponseData[];
  signatories: SignatoryResponseData[];
  widgets: WidgetResponseData[];
  processCards: ProcessCardResponseData[];
}

const ProgressTracker: React.FC<
  FormPageComponentProps<ProgressTrackerResponseData>
> = ({ state, handleReactSelect, dependencies, setState, loading, mode }) => {
  const params = useParams();
  const { openModal, closeModal } = useModal();
  const [workflows, setWorkflows] = useState<WorkflowResponseData[]>([]);
  const [stages, setStages] = useState<WorkflowStageResponseData[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DataOptionsProps[]>([]);
  const [carders, setCarders] = useState<DataOptionsProps[]>([]);
  const [signatories, setSignatories] = useState<SignatoryResponseData[]>([]);
  const [departments, setDepartments] = useState<DataOptionsProps[]>([]);
  const [queue, setQueue] = useState<ServerTrackerData[]>([]);
  const [widgets, setWidgets] = useState<DataOptionsProps[]>([]);
  const [processCards, setProcessCards] = useState<DataOptionsProps[]>([]);

  const trackerRepo = useMemo(() => repo("progress_tracker"), []);

  const [trackerState, setTrackerState] = useState<ServerTrackerData>({
    id: 0,
    identifier: "",
    workflow_stage_id: 0,
    group_id: 0,
    department_id: 0,
    carder_id: 0,
    document_type_id: 0,
    signatory_id: 0,
    internal_process_id: 0,
    process_card_id: 0,
    order: 0,
    permission: "r",
    stage_name: "",
    actions: [],
    recipients: [],
    widgets: [],
  });

  const backendUrl = useMemo(() => "https://portal.test", []);
  const stageRepo = useMemo(() => new WorkflowStageRepository(), []);

  const [selectedOptions, setSelectedOptions] = useState<{
    workflow: DataOptionsProps | null;
    process_card: DataOptionsProps | null;
  }>({
    workflow: null,
    process_card: null,
  });

  const handleAddToQueue = (stage: WorkflowStageResponseData) => {
    const response: ServerTrackerData = {
      id: 0,
      identifier: generateUniqueString(32),
      workflow_stage_id: stage.id,
      process_card_id: 0,
      group_id: 0,
      department_id: 0,
      carder_id: 0,
      document_type_id: 0,
      signatory_id: 0,
      internal_process_id: 0,
      order: queue.length + 1,
      permission: "r",
      stage_name: stage.name,
      actions: [],
      recipients: [],
      widgets: [],
    };

    setQueue([...queue, response]);
  };

  const onSubmit = (
    response: unknown,
    mode: "store" | "update" | "destroy" | "generate"
  ) => {
    const raw = response as ServerTrackerData;

    setQueue(
      queue.map((que) => {
        if (que.identifier === raw.identifier) {
          return raw;
        }

        return que;
      })
    );
    closeModal();
  };

  const manageTracker = (tracker: ServerTrackerData) => {
    const stage = stages.find((raw) => raw.id === tracker.workflow_stage_id);

    if (stage) {
      openModal(
        TrackerModal,
        "tracker",
        {
          title: `Manage ${stage.name} Tracker`,
          isUpdating: true,
          onSubmit,
          data: tracker,
          dependencies: [
            departments,
            documentTypes,
            carders,
            [stage],
            signatories,
            workflows,
            widgets,
            processCards,
          ],
        },
        trackerState
      );
    }
  };

  const handleRemoveTracker = (tracker: ServerTrackerData) => {
    Alert.flash(
      "Are you Sure?",
      "error",
      "You will not be able to reverse this!!"
    ).then((result) => {
      if (result.isConfirmed) {
        const newQueue = queue
          .filter((track) => track.identifier !== tracker.identifier)
          .map((track, idx) => ({ ...track, order: idx + 1 }));

        setQueue(newQueue);
      }
    });
  };

  const getGroup = (selected: number, groupId: number) => {
    const stage = stages.find((stg) => stg.id === selected);

    if (!stage) {
      return "Not Set!";
    }

    const grp = stage.groups.find((grp) => grp.value === groupId);

    return grp ? grp.label : "Not Set!!";
  };

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

  const handleStages = (stage: WorkflowStageResponseData) => {
    return stageRepo.fromJson(stage);
  };

  useEffect(() => {
    if (setState) {
      setState((prev) => ({
        ...prev,
        stages: queue,
      }));
    }
  }, [queue, setState]);

  useEffect(() => {
    if (dependencies) {
      const {
        workflows = [],
        stages = [],
        documentTypes = [],
        carders = [],
        departments = [],
        signatories = [],
        widgets = [],
        processCards = [],
      } = dependencies as DependencyProps;

      setWorkflows(workflows);
      setStages(stages.map((stage) => handleStages(stage)));
      setCarders(formatOptions(carders, "id", "name"));
      setDepartments([
        { value: 0, label: "Originating Department" },
        ...formatOptions(departments, "id", "name"),
      ]);
      setSignatories(signatories);
      setDocumentTypes(formatOptions(documentTypes, "id", "name"));
      setWidgets(formatOptions(widgets, "id", "title", true));
      setProcessCards(formatOptions(processCards, "id", "name"));
    }
  }, [dependencies]);

  useEffect(() => {
    if (
      mode === "update" &&
      workflows.length > 0 &&
      _.isObject(params) &&
      _.has(params, "id")
    ) {
      const { id } = params;
      const currentWorkflow = workflows.find(
        (workflow) => workflow.id === Number(id)
      );

      setSelectedOptions({
        workflow: {
          value: currentWorkflow?.id,
          label: currentWorkflow?.name as string,
        },
        process_card: null,
      });

      if (setState) {
        setState((prev) => ({
          ...prev,
          workflow_id: currentWorkflow?.id ?? 0,
        }));
      }

      const trackers = currentWorkflow?.trackers;

      const queued: ServerTrackerData[] = trackers
        ? trackers?.map((tracker) => ({
            id: tracker.order,
            order: tracker.order,
            identifier: tracker.identifier ?? "",
            workflow_stage_id: tracker.workflow_stage_id,
            group_id: tracker.group_id,
            department_id: tracker.department_id,
            carder_id: tracker.carder_id,
            signatory_id: tracker.signatory_id,
            process_card_id: tracker.process_card_id,
            permission: tracker.permission,
            document_type_id: tracker.document_type_id,
            internal_process_id: tracker.internal_process_id,
            stage_name: tracker?.stage?.name as string,
            actions: formatOptions(tracker.actions, "id", "name"),
            recipients: formatOptions(tracker.recipients, "id", "name"),
            widgets: formatOptions(tracker?.widgets ?? [], "id", "title", true),
          }))
        : [];

      setQueue(queued);
    }
  }, [mode, workflows]);

  // console.log(queue);

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
    <div className="progress-tracker-modern">
      {/* Header Section */}
      <div className="tracker-header">
        <div className="header-content">
          <h2 className="tracker-title">
            <i className="ri-flow-chart"></i>
            Workflow Progress Tracker
          </h2>
          <p className="tracker-subtitle">
            Configure and manage your workflow stages
          </p>
        </div>
        {renderMultiSelect(
          "Select Workflow",
          formatOptions(workflows, "id", "name"),
          selectedOptions.workflow,
          handleSelectionChange("workflow"),
          "Choose a workflow to configure",
          4
        )}
      </div>

      {/* Main Content Grid */}
      <div className="tracker-main-grid">
        {/* Stages Section */}
        <div className="stages-section">
          <div className="section-header">
            <h3 className="section-title">
              <i className="ri-stack-line"></i>
              Available Stages
            </h3>
            <p className="section-subtitle">Add stages to your tracker queue</p>
          </div>

          <div className="stages-grid">
            {stages.map((stage, index) => (
              <div key={index} className="stage-card">
                <div className="stage-icon">
                  <img
                    src={backendUrl + stage.stage_category?.icon_path}
                    alt={stage.name}
                  />
                </div>
                <div className="stage-content">
                  <h4 className="stage-name">{stage.name}</h4>
                  <p className="stage-description">Click to add to queue</p>
                </div>
                <button
                  type="button"
                  className="add-stage-btn"
                  onClick={() => handleAddToQueue(stage)}
                  disabled={loading}
                >
                  <i className="ri-add-line"></i>
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Queue Section */}
        <div className="queue-section">
          <div className="section-header">
            <h3 className="section-title">
              <i className="ri-list-check-2"></i>
              Tracker Queue
              <span className="queue-count">({queue.length})</span>
            </h3>
            <p className="section-subtitle">Manage your workflow sequence</p>
          </div>

          <div className="queue-container">
            {queue.length === 0 ? (
              <div className="empty-queue">
                <i className="ri-inbox-line"></i>
                <p>No stages in queue</p>
                <small>Add stages from the left panel to get started</small>
              </div>
            ) : (
              <div className="queue-list">
                {queue.map((item, idx) => (
                  <div className="queue-item" key={idx}>
                    <div className="item-header">
                      <div className="item-order">
                        <span className="order-number">{item.order}</span>
                      </div>
                      <div className="item-info">
                        <h4 className="item-title">{item.stage_name}</h4>
                        <div className="item-meta">
                          <span className="meta-item">
                            <i className="ri-group-line"></i>
                            {getGroup(item.workflow_stage_id, item.group_id)}
                          </span>
                          <span className="meta-item">
                            <i className="ri-file-list-line"></i>
                            {documentTypes.find(
                              (doc) => doc.value === item.document_type_id
                            )?.label ?? "No Document Type"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="item-details">
                      <div className="detail-group">
                        <label className="detail-label">
                          <i className="ri-play-circle-line"></i>
                          Actions
                        </label>
                        <div className="detail-tags">
                          {item.actions.length > 0 ? (
                            item.actions.map((action, i) => (
                              <span key={i} className="detail-tag actions">
                                {action.label}
                              </span>
                            ))
                          ) : (
                            <span className="detail-tag empty">No actions</span>
                          )}
                        </div>
                      </div>

                      <div className="detail-group">
                        <label className="detail-label">
                          <i className="ri-mail-line"></i>
                          Recipients
                        </label>
                        <div className="detail-tags">
                          {item.recipients.length > 0 ? (
                            item.recipients.map((recipient, i) => (
                              <span key={i} className="detail-tag recipients">
                                {recipient.label}
                              </span>
                            ))
                          ) : (
                            <span className="detail-tag empty">
                              No recipients
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="item-actions">
                      <button
                        type="button"
                        className="action-btn manage"
                        onClick={() => manageTracker(item)}
                      >
                        <i className="ri-settings-3-line"></i>
                        Manage
                      </button>
                      <button
                        type="button"
                        className="action-btn remove"
                        onClick={() => handleRemoveTracker(item)}
                      >
                        <i className="ri-delete-bin-line"></i>
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;
