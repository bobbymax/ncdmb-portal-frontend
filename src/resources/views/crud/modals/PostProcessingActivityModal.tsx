import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ModalValueProps, useModal } from "app/Context/ModalContext";
import { toTitleCase } from "bootstrap/repositories";
import { toast } from "react-toastify";
import MultiSelect, {
  DataOptionsProps,
} from "resources/views/components/forms/MultiSelect";
import Select from "resources/views/components/forms/Select";
import TextInput from "resources/views/components/forms/TextInput";
import Button from "resources/views/components/forms/Button";
import { WorkflowStageResponseData } from "app/Repositories/WorkflowStage/data";
import { DocumentActionResponseData } from "app/Repositories/DocumentAction/data";
import { ProcessActivitiesProps } from "../DocumentCategoryConfiguration";
import { WorkflowResponseData } from "@/app/Repositories/Workflow/data";
import { formatOptions } from "app/Support/Helpers";

const PROCESS_ACTIVITY_CATEGORY_OPTIONS: {
  value: ProcessActivitiesProps["category"];
  label: string;
}[] = [
  { value: "default", label: "Default" },
  { value: "add_tracker", label: "Add Tracker" },
  { value: "notify", label: "Notify" },
  { value: "mail", label: "Mail" },
  { value: "no_action", label: "No Action" },
];

const DEFAULT_ACTION_STATUSES: DocumentActionResponseData["action_status"][] = [
  "processing",
  "passed",
  "failed",
  "stalled",
  "cancelled",
  "complete",
  "reversed",
  "appeal",
  "escalate",
];

const createEmptyProcessActivity = (): ProcessActivitiesProps => ({
  title: "",
  workflow_id: 0,
  workflow_stage_id: 0,
  group_id: 0,
  department_id: 0,
  document_action_status: "",
  trigger_action_id: 0,
  category: "default",
  user_id: 0,
});

type OptionSet = {
  workflowOptions: DataOptionsProps[];
  workflowStageOptions: DataOptionsProps[];
  groupOptions: DataOptionsProps[];
  departmentOptions: DataOptionsProps[];
  userOptions: DataOptionsProps[];
};

type ModalExtras = {
  editingIndex: number | null;
  workflows: WorkflowResponseData[];
  workflowStages: WorkflowStageResponseData[];
  documentActions: DocumentActionResponseData[];
  options: OptionSet;
  activity?: ProcessActivitiesProps | null;
};

const PostProcessingActivityModal: React.FC<ModalValueProps> = ({
  dependencies,
  onSubmit,
  isUpdating,
}) => {
  const { closeModal } = useModal();

  const payload =
    (dependencies && dependencies[0] && (dependencies[0][0] as ModalExtras)) ||
    ({} as ModalExtras);

  const {
    workflowStages = [],
    documentActions = [],
    workflows = [],
    options = {
      workflowStageOptions: [],
      groupOptions: [],
      departmentOptions: [],
      userOptions: [],
      workflowOptions: [],
    },
    editingIndex = null,
    activity = null,
  } = payload;

  const [activityState, setActivityState] = useState<ProcessActivitiesProps>(
    activity ? { ...activity } : createEmptyProcessActivity()
  );
  const [availableActions, setAvailableActions] = useState<
    DocumentActionResponseData[]
  >([]);
  const [stageGroupOptions, setStageGroupOptions] = useState<
    DataOptionsProps[]
  >(options.groupOptions);
  const [selectedOptions, setSelectedOptions] = useState<{
    workflow: DataOptionsProps | null;
    workflow_stage: DataOptionsProps | null;
    group: DataOptionsProps | null;
    department: DataOptionsProps | null;
    user: DataOptionsProps | null;
    trigger_action: DataOptionsProps | null;
  }>({
    workflow: null,
    workflow_stage: null,
    group: null,
    department: null,
    user: null,
    trigger_action: null,
  });

  const baseActionOptions = useMemo(
    () => formatOptions(documentActions, "id", "button_text"),
    [documentActions]
  );

  const triggerActionOptions = useMemo(() => {
    if (availableActions.length > 0) {
      return formatOptions(
        availableActions,
        "id",
        "button_text",
        true,
        false,
        "No Action"
      );
    }
    return baseActionOptions;
  }, [availableActions, baseActionOptions]);

  useEffect(() => {
    const initialActivity = activity
      ? { ...activity }
      : createEmptyProcessActivity();
    setActivityState(initialActivity);

    const findOption = (
      opts: DataOptionsProps[] = [],
      value?: number | string | null
    ) => opts.find((opt) => String(opt.value) === String(value ?? "")) || null;

    setSelectedOptions({
      workflow: findOption(
        options.workflowOptions,
        initialActivity.workflow_id
      ),
      workflow_stage: findOption(
        options.workflowStageOptions,
        initialActivity.workflow_stage_id
      ),
      group: findOption(options.groupOptions, initialActivity.group_id),
      department: findOption(
        options.departmentOptions,
        initialActivity.department_id
      ),
      user: findOption(options.userOptions, initialActivity.user_id),
      trigger_action: findOption(
        baseActionOptions,
        initialActivity.trigger_action_id
      ),
    });

    if (initialActivity.workflow_stage_id) {
      const stage = workflowStages.find(
        (ws) => ws.id === initialActivity.workflow_stage_id
      );
      const stageActions =
        (stage?.actions as unknown as DocumentActionResponseData[]) || [];
      setAvailableActions(stageActions);
    } else {
      setAvailableActions([]);
    }
  }, [
    activity,
    workflowStages,
    options.workflowStageOptions,
    options.groupOptions,
    options.departmentOptions,
    options.userOptions,
    baseActionOptions,
  ]);

  useEffect(() => {
    if (!activityState.workflow_stage_id) {
      setStageGroupOptions(options.groupOptions);
    }
  }, [activityState.workflow_stage_id, options.groupOptions]);

  const optionFieldMap: Record<
    keyof typeof selectedOptions,
    keyof ProcessActivitiesProps
  > = {
    workflow: "workflow_id",
    workflow_stage: "workflow_stage_id",
    group: "group_id",
    department: "department_id",
    user: "user_id",
    trigger_action: "trigger_action_id",
  };

  const resolveActionStatus = useCallback(
    (actionId?: number | null) => {
      if (!actionId || actionId <= 0) {
        return "";
      }
      const action =
        availableActions.find((a) => a.id === actionId) ||
        documentActions.find((a) => a.id === actionId) ||
        null;
      return action?.action_status || "";
    },
    [availableActions, documentActions]
  );

  const handleSelectionChange = useCallback(
    (key: keyof typeof selectedOptions) => (newValue: unknown) => {
      const option = Array.isArray(newValue)
        ? null
        : (newValue as DataOptionsProps) ?? null;

      setSelectedOptions((prev) => ({ ...prev, [key]: option }));

      const field = optionFieldMap[key];
      setActivityState((prev) => ({
        ...prev,
        [field]:
          option && option.value !== undefined ? Number(option.value) : 0,
      }));

      if (key === "workflow") {
        setSelectedOptions((prev) => ({
          ...prev,
          workflow_stage: null,
          trigger_action: null,
        }));
        setActivityState((prev) => ({
          ...prev,
          workflow_stage_id: 0,
          trigger_action_id: 0,
          document_action_status: "",
        }));
        setAvailableActions([]);
        return;
      }

      if (key === "workflow_stage") {
        if (option?.value) {
          const stage = workflowStages.find((ws) => ws.id === option.value);
          const stageActions =
            (stage?.actions as unknown as DocumentActionResponseData[]) || [];
          setAvailableActions(stageActions);

          const stageGroups =
            (stage?.groups as DataOptionsProps[]) || options.groupOptions;
          const nextGroupOptions =
            stageGroups && stageGroups.length > 0
              ? stageGroups
              : options.groupOptions;
          setStageGroupOptions(nextGroupOptions);

          const hasValidGroup = nextGroupOptions.some(
            (groupOption) => groupOption.value === selectedOptions.group?.value
          );
          if (!hasValidGroup && selectedOptions.group) {
            setSelectedOptions((prev) => ({ ...prev, group: null }));
            setActivityState((prev) => ({ ...prev, group_id: 0 }));
          }

          const hasExistingAction = stageActions.some(
            (action) => action.id === activityState.trigger_action_id
          );
          if (!hasExistingAction) {
            setActivityState((prev) => ({
              ...prev,
              trigger_action_id: 0,
              document_action_status: "",
            }));
            setSelectedOptions((prev) => ({
              ...prev,
              trigger_action: null,
            }));
          }
        } else {
          setStageGroupOptions(options.groupOptions);
          setAvailableActions([]);
        }
      } else if (key === "trigger_action") {
        if (option?.value) {
          const actionStatus = resolveActionStatus(Number(option.value));
          setActivityState((prev) => ({
            ...prev,
            document_action_status: actionStatus,
          }));
        } else {
          setActivityState((prev) => ({
            ...prev,
            document_action_status: "",
          }));
        }
      }
    },
    [
      workflowStages,
      activityState.trigger_action_id,
      resolveActionStatus,
      selectedOptions.group,
      options.groupOptions,
    ]
  );

  useEffect(() => {
    const status = resolveActionStatus(activityState.trigger_action_id);
    setActivityState((prev) =>
      prev.document_action_status === status
        ? prev
        : { ...prev, document_action_status: status }
    );
  }, [activityState.trigger_action_id, resolveActionStatus]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setActivityState((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setActivityState((prev) => ({
      ...prev,
      category: value as ProcessActivitiesProps["category"],
    }));
  };

  const handleSave = () => {
    if (!activityState.title.trim()) {
      toast.error("Please provide a title for this activity.");
      return;
    }

    if (!activityState.workflow_stage_id) {
      toast.error("Select the workflow stage this activity belongs to.");
      return;
    }

    if (!activityState.group_id) {
      toast.error("Select the group responsible for this activity.");
      return;
    }

    const payload: ProcessActivitiesProps = {
      ...activityState,
      id: activityState.id || Date.now(),
    };

    onSubmit?.(
      {
        activity: payload,
        index: editingIndex,
      },
      isUpdating ? "update" : "store"
    );
  };

  console.log(workflowStages);

  return (
    <div className="container-fluid post-processing-modal px-0">
      <div className="row gy-3">
        <div className="col-12">
          <TextInput
            label="Activity Title"
            name="title"
            placeholder="e.g. Archive, escalate, or notify watchers"
            value={activityState.title}
            onChange={handleInputChange}
          />
        </div>
        <div className="col-md-4">
          <MultiSelect
            label="Processor's Desk"
            options={options.workflowStageOptions}
            value={selectedOptions.workflow_stage}
            onChange={handleSelectionChange("workflow_stage")}
            placeholder="workflow stage"
            isSearchable
          />
        </div>
        <div className="col-md-4">
          <MultiSelect
            label="Responsible Group"
            options={stageGroupOptions}
            value={selectedOptions.group}
            onChange={handleSelectionChange("group")}
            placeholder="group"
            isSearchable
            isDisabled={stageGroupOptions.length === 0}
          />
        </div>
        <div className="col-md-4">
          <MultiSelect
            label="Department"
            options={options.departmentOptions}
            value={selectedOptions.department}
            onChange={handleSelectionChange("department")}
            placeholder="department"
            isSearchable
          />
        </div>
        <div className="col-md-5">
          <MultiSelect
            label="Trigger Workflow"
            options={options.workflowOptions}
            value={selectedOptions.workflow}
            onChange={handleSelectionChange("workflow")}
            placeholder="workflow"
            isSearchable
          />
        </div>

        <div className="col-md-4">
          <MultiSelect
            label="Trigger Action"
            options={triggerActionOptions}
            value={selectedOptions.trigger_action}
            onChange={handleSelectionChange("trigger_action")}
            placeholder="trigger action"
            isDisabled={availableActions.length === 0}
            isSearchable
          />
        </div>

        <div className="col-md-3">
          <TextInput
            label="Action Status"
            name="post-processing-status"
            value={
              activityState.document_action_status
                ? toTitleCase(
                    activityState.document_action_status.replace(/_/g, " ")
                  )
                : "Auto"
            }
            onChange={() => undefined}
            isDisabled
          />
        </div>

        <div className="col-md-7">
          <MultiSelect
            label="Fixed Operational User"
            options={options.userOptions}
            value={selectedOptions.user}
            onChange={handleSelectionChange("user")}
            placeholder="user"
            isSearchable
          />
        </div>

        <div className="col-md-5">
          <Select
            label="Activity Category"
            name="post-processing-category"
            value={activityState.category}
            onChange={handleCategoryChange}
            defaultValue=""
            defaultText="Select category"
            valueKey="value"
            labelKey="label"
            options={PROCESS_ACTIVITY_CATEGORY_OPTIONS}
            size="xl"
          />
        </div>
      </div>

      <div className="d-flex justify-content-end gap-2 mt-4">
        <Button
          label="Cancel"
          variant="outline"
          size="md"
          handleClick={closeModal}
        />
        <Button
          label={isUpdating ? "Update Activity" : "Add Activity"}
          variant="success"
          size="md"
          icon="ri-check-line"
          handleClick={handleSave}
        />
      </div>
    </div>
  );
};

export default PostProcessingActivityModal;
