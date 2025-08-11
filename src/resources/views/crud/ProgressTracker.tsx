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

interface DependencyProps {
  workflows: WorkflowResponseData[];
  stages: WorkflowStageResponseData[];
  documentTypes: DocumentTypeResponseData[];
  carders: CarderResponseData[];
  departments: DepartmentResponseData[];
  signatories: SignatoryResponseData[];
  widgets: WidgetResponseData[];
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
  }>({
    workflow: null,
  });

  const handleAddToQueue = (stage: WorkflowStageResponseData) => {
    const response: ServerTrackerData = {
      id: 0,
      identifier: generateUniqueString(32),
      workflow_stage_id: stage.id,
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
        formatOptions(workflows, "id", "name"),
        selectedOptions.workflow,
        handleSelectionChange("workflow"),
        "Workflow",
        3
      )}

      <div className="tracker__container">
        <div className="row">
          <div className="col-md-8">
            <div className="desk_stages flex align gap-lg">
              {stages.map((stage, index) => (
                <div key={index} className="desk_stages_index">
                  <div className="process__image">
                    <img
                      src={backendUrl + stage.stage_category?.icon_path}
                      alt="Process Icon"
                    />
                  </div>
                  <div className="process_details mt-3">
                    <h5 className="mb-2">{stage.name}</h5>
                  </div>
                  <div className="footer__design mt-4">
                    <Button
                      label="Add to Tracker Queue"
                      size="xs"
                      variant="dark"
                      icon="ri-archive-stack-line"
                      handleClick={() => handleAddToQueue(stage)}
                      // isDisabled
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="col-md-4">
            <div className="queue__board">
              <h4 className="mb-4">Queued Trackers</h4>

              <div className="queue__container flex column gap-md">
                {queue.map((list, idx) => (
                  <div className="tracker__item flex column" key={idx}>
                    <div className="order_line flex align gap-md">
                      <div className="number__widget">{list.order}</div>
                      <p>
                        {list.stage_name}
                        <br />
                        <small>
                          {getGroup(list.workflow_stage_id, list.group_id)}
                        </small>
                        <br />
                        <small>
                          {documentTypes.find(
                            (doc) => doc.value === list.document_type_id
                          )?.label ?? "No Document Type!!"}
                        </small>
                      </p>
                    </div>
                    <div className="mid__section mb-3">
                      <div className="item__section mb-2">
                        <small>Actions:</small>
                        <div className="stones_container">
                          {list.actions.length > 0 ? (
                            list.actions.map((action, i) => (
                              <div key={i} className="stones actions">
                                {action.label}
                              </div>
                            ))
                          ) : (
                            <div className="stones actions">no actions</div>
                          )}
                        </div>
                      </div>
                      <div className="item__section mb-2">
                        <small>Distribution Lists:</small>
                        <div className="stones_container">
                          {list.recipients.length > 0 ? (
                            list.recipients.map((mailer, i) => (
                              <div key={i} className="stones distribution">
                                {mailer.label}
                              </div>
                            ))
                          ) : (
                            <div className="stones distribution">
                              empty list
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="process_actions flex align">
                      <CardButton
                        icon="ri-settings-2-line"
                        label="Manage"
                        variant="dark"
                        handleClick={() => manageTracker(list)}
                        size="sm"
                      />
                      <CardButton
                        label="Remove"
                        icon="ri-close-large-line"
                        variant="danger"
                        handleClick={() => handleRemoveTracker(list)}
                        size="sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProgressTracker;
