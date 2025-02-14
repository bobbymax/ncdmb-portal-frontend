/* eslint-disable react-hooks/exhaustive-deps */
import { useStateContext } from "app/Context/ContentContext";
import { ModalValueProps, useModal } from "app/Context/ModalContext";
import React, {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ServerTrackersRequestProps } from "../ProgressTracker";
import MultiSelect, {
  DataOptionsProps,
} from "resources/views/components/forms/MultiSelect";
import { WorkflowStageResponseData } from "app/Repositories/WorkflowStage/data";
import { formatOptions } from "app/Support/Helpers";
import { ActionMeta } from "react-select";
import Button from "resources/views/components/forms/Button";

type ModalDependenciesProps = [
  stages: WorkflowStageResponseData[],
  documentTypes: DataOptionsProps[],
  actions: DataOptionsProps[],
  recipients: DataOptionsProps[]
];

const TrackerModal: React.FC<ModalValueProps> = ({
  data,
  isUpdating,
  dependencies,
  onSubmit,
}) => {
  const { getModalState, updateModalState } = useModal();
  const { isLoading } = useStateContext();
  const identifier = "tracker";
  const state: ServerTrackersRequestProps = getModalState(identifier);

  const [stages, setStages] = useState<WorkflowStageResponseData[]>([]);
  const [actions, setActions] = useState<DataOptionsProps[]>([]);
  const [docTypes, setDocTypes] = useState<DataOptionsProps[]>([]);
  const [recipients, setRecipients] = useState<DataOptionsProps[]>([]);
  const [selectedSingleOptions, setSelectedSingleOptions] = useState<{
    document_type: DataOptionsProps | null;
    fallback_to_stage: DataOptionsProps | null;
    return_to_stage: DataOptionsProps | null;
  }>({
    document_type: null,
    fallback_to_stage: null,
    return_to_stage: null,
  });

  const [multipleSelections, setMultipleSelections] = useState<{
    actions: DataOptionsProps[];
    recipients: DataOptionsProps[];
  }>({
    actions: [],
    recipients: [],
  });

  const handleMultiSelectChange = useCallback(
    (key: "actions" | "recipients") => (newValue: unknown) => {
      const updatedValue = newValue as DataOptionsProps[];

      setMultipleSelections((prev) => ({
        ...prev,
        [key]: updatedValue,
      }));

      updateModalState(identifier, { [key]: updatedValue });
    },
    [multipleSelections, updateModalState]
  );

  const handleSelectionChange =
    (key: "document_type" | "fallback_to_stage" | "return_to_stage") =>
    (newValue: unknown) => {
      const updatedValue = newValue as DataOptionsProps;

      setSelectedSingleOptions((prev) => ({
        ...prev,
        [key]: updatedValue,
      }));

      updateModalState(identifier, {
        [`${key}_id`]: updatedValue?.value ?? 0,
      });
    };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(state, isUpdating ? "update" : "store");
  };

  useEffect(() => {
    if (!data || stages.length === 0 || docTypes.length === 0) return;

    const raw = data as ServerTrackersRequestProps;
    updateModalState(identifier, raw);

    setSelectedSingleOptions((prev) => ({
      ...prev,
      document_type:
        docTypes.find((doc) => doc.value === raw.document_type_id) ?? null,
      fallback_to_stage: stages.find(
        (stage) => stage.id === raw.fallback_to_stage_id
      )
        ? {
            value: raw.fallback_to_stage_id,
            label:
              stages.find((stage) => stage.id === raw.fallback_to_stage_id)
                ?.name || "Unknown",
          }
        : { value: 0, label: "None" },
      return_to_stage: stages.find(
        (stage) => stage.id === raw.return_to_stage_id
      )
        ? {
            value: raw.return_to_stage_id,
            label:
              stages.find((stage) => stage.id === raw.return_to_stage_id)
                ?.name || "Unknown",
          }
        : { value: 0, label: "None" },
    }));

    // Update multiple selections
    setMultipleSelections((prev) => ({
      ...prev,
      actions: raw.actions,
      recipients: raw.recipients,
    }));
  }, [data, stages, docTypes]);

  useEffect(() => {
    if (dependencies) {
      const [stages = [], documentTypes = [], actions = [], recipients = []] =
        dependencies as ModalDependenciesProps;

      setStages(stages);
      setDocTypes(documentTypes);
      setActions(actions);
      setRecipients(recipients);
    }
  }, [dependencies]);

  const formattedStages = useMemo(
    () => [{ value: 0, label: "None" }, ...formatOptions(stages, "id", "name")],
    [stages]
  );

  const renderMultiSelect = (
    label: string,
    options: DataOptionsProps[],
    value: DataOptionsProps | DataOptionsProps[] | null,
    onChange: (newValue: unknown, actionMeta: ActionMeta<unknown>) => void,
    placeholder: string,
    grid: number = 4,
    isMulti: boolean = false
  ) => (
    <div className={`col-md-${grid} mb-3`}>
      <MultiSelect
        label={label}
        options={options}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        isSearchable
        isDisabled={isLoading}
        isMulti={isMulti}
      />
    </div>
  );

  return (
    <form onSubmit={handleFormSubmit}>
      <div className="row">
        {renderMultiSelect(
          "Document Types",
          docTypes,
          selectedSingleOptions.document_type,
          handleSelectionChange("document_type"),
          "Document Type",
          4
        )}
        {renderMultiSelect(
          "Fallback Stages",
          formattedStages,
          selectedSingleOptions.fallback_to_stage,
          handleSelectionChange("fallback_to_stage"),
          "Fallback Stage",
          4
        )}
        {renderMultiSelect(
          "Return to Stages",
          formattedStages,
          selectedSingleOptions.return_to_stage,
          handleSelectionChange("return_to_stage"),
          "Return to Stage",
          4
        )}
        {renderMultiSelect(
          "Actions",
          actions,
          multipleSelections.actions,
          handleMultiSelectChange("actions"),
          "Stage Actions",
          6,
          true
        )}
        {renderMultiSelect(
          "Mailing List",
          recipients,
          multipleSelections.recipients,
          handleMultiSelectChange("recipients"),
          "Stage Recipients",
          6,
          true
        )}
        <div className="col-md-12">
          <Button
            label="Update Tracker"
            icon="ri-list-settings-line"
            type="submit"
            variant="success"
            size="sm"
            isDisabled={
              !state ||
              state.actions?.length === 0 ||
              state.recipients?.length === 0
            }
          />
        </div>
      </div>
    </form>
  );
};

export default TrackerModal;
