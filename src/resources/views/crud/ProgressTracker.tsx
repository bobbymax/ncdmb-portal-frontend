/* eslint-disable react-hooks/exhaustive-deps */
import { ProgressTrackerResponseData } from "app/Repositories/ProgressTracker/data";
import { WorkflowResponseData } from "app/Repositories/Workflow/data";
import { WorkflowStageResponseData } from "app/Repositories/WorkflowStage/data";
import { FormPageComponentProps } from "bootstrap";
import React, { useCallback, useEffect, useState } from "react";
import MultiSelect, { DataOptionsProps } from "../components/forms/MultiSelect";
import { ActionMeta } from "react-select";
import { formatOptions } from "app/Support/Helpers";
import TextInput from "../components/forms/TextInput";

interface DependencyProps {
  workflows: WorkflowResponseData[];
  stages: WorkflowStageResponseData[];
}

const ProgressTracker: React.FC<
  FormPageComponentProps<ProgressTrackerResponseData>
> = ({
  state,
  handleChange,
  handleReactSelect,
  dependencies,
  setState,
  loading,
}) => {
  const [workflows, setWorkflows] = useState<DataOptionsProps[]>([]);
  const [stages, setStages] = useState<DataOptionsProps[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<{
    workflow: DataOptionsProps | null;
    workflow_stage: DataOptionsProps | null;
  }>({
    workflow: null,
    workflow_stage: null,
  });

  const handleSelectionChange = useCallback(
    (key: "workflow_stage" | "workflow") =>
      (newValue: unknown, actionMeta: ActionMeta<unknown>) => {
        handleReactSelect(newValue, actionMeta, (value) => {
          const updatedValue = value as DataOptionsProps;
          setSelectedOptions((prev) => ({ ...prev, [key]: updatedValue }));
          if (setState) {
            setState({
              ...state,
              [`${key}_id`]: updatedValue?.value ?? 0,
            });
          }
        });
      },
    [handleReactSelect, setState]
  );

  useEffect(() => {
    if (dependencies) {
      const { workflows = [], stages = [] } = dependencies as DependencyProps;

      setWorkflows(formatOptions(workflows, "id", "name"));
      setStages(formatOptions(stages, "id", "name"));
    }
  }, [dependencies]);

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
        5
      )}
      {renderMultiSelect(
        "Stage",
        stages,
        selectedOptions.workflow_stage,
        handleSelectionChange("workflow_stage"),
        "Workflow Stage",
        5
      )}
      <div className="col-md-2 mb-3">
        <TextInput
          label="Order"
          name="order"
          type="number"
          value={state.order}
          onChange={handleChange}
          isDisabled={loading}
        />
      </div>
    </>
  );
};

export default ProgressTracker;
