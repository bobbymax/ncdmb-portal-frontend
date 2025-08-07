/* eslint-disable react-hooks/exhaustive-deps */
import { DepartmentResponseData } from "app/Repositories/Department/data";
import { GroupResponseData } from "app/Repositories/Group/data";
import { WorkflowStageResponseData } from "app/Repositories/WorkflowStage/data";
import { FormPageComponentProps } from "bootstrap";
import React, { useCallback, useEffect, useState } from "react";
import MultiSelect, { DataOptionsProps } from "../components/forms/MultiSelect";
import { formatOptions } from "app/Support/Helpers";
import { ActionMeta } from "react-select";
import TextInput from "../components/forms/TextInput";
import { StageCategoryResponseData } from "app/Repositories/StageCategory/data";
import Select from "../components/forms/Select";
import { DocumentActionResponseData } from "app/Repositories/DocumentAction/data";
import { MailingListResponseData } from "app/Repositories/MailingList/data";

interface DependencyProps {
  departments: DepartmentResponseData[];
  groups: GroupResponseData[];
  stageCategories: StageCategoryResponseData[];
  stages: WorkflowStageResponseData[];
  actions: DocumentActionResponseData[];
  recipients: MailingListResponseData[];
}

const WorkflowStage: React.FC<
  FormPageComponentProps<WorkflowStageResponseData>
> = ({
  state,
  setState,
  handleChange,
  handleReactSelect,
  dependencies,
  loading,
  mode,
}) => {
  const [stageCategories, setStageCategories] = useState<
    StageCategoryResponseData[]
  >([]);
  const [groups, setGroups] = useState<DataOptionsProps[]>([]);
  const [departments, setDepartments] = useState<DataOptionsProps[]>([]);
  const [actions, setActions] = useState<DataOptionsProps[]>([]);
  const [recipients, setRecipients] = useState<DataOptionsProps[]>([]);
  const [stages, setStages] = useState<DataOptionsProps[]>([]);

  const [multipleSelections, setMultipleSelections] = useState<{
    groups: DataOptionsProps[];
    actions: DataOptionsProps[];
    recipients: DataOptionsProps[];
  }>({
    groups: [],
    actions: [],
    recipients: [],
  });

  const [selectedOptions, setSelectedOptions] = useState<{
    workflow_stage_category: DataOptionsProps | null;
    fallback_stage: DataOptionsProps | null;
    department: DataOptionsProps | null;
  }>({
    workflow_stage_category: null,
    fallback_stage: null,
    department: null,
  });

  const handleMultipleSelectionChange = useCallback(
    (key: "groups" | "actions" | "recipients") =>
      (newValue: unknown, actionMeta: ActionMeta<unknown>) => {
        handleReactSelect(newValue, actionMeta, (value) => {
          const updatedValue = value as DataOptionsProps[];
          setMultipleSelections((prev) => ({ ...prev, [key]: updatedValue }));
          if (setState) {
            setState({
              ...state,
              [key]: updatedValue,
            });
          }
        });
      },
    [handleReactSelect, setState]
  );

  const handleSelectionChange = useCallback(
    (key: "workflow_stage_category" | "fallback_stage" | "department") =>
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
      const {
        stageCategories = [],
        departments = [],
        groups = [],
        actions = [],
        recipients = [],
        stages = [],
      } = dependencies as DependencyProps;

      const listOfDepartments = formatOptions(departments, "id", "abv");

      setStageCategories(stageCategories);
      setActions(formatOptions(actions, "id", "name"));
      setRecipients(formatOptions(recipients, "id", "name"));
      setStages([
        { label: "None", value: 0 },
        ...formatOptions(stages, "id", "name"),
      ]);

      setDepartments([
        { value: 0, label: "Originating Department" },
        ...listOfDepartments,
      ]);
      setGroups(formatOptions(groups, "id", "name"));
      // setWorkflowStageCategories(stageCategories);
    }
  }, [dependencies]);

  useEffect(() => {
    if (
      mode === "update" &&
      stageCategories.length > 0 &&
      departments.length > 0 &&
      groups.length > 0 &&
      stages.length > 0 &&
      actions.length > 0 &&
      recipients.length > 0
    ) {
      const department = departments.find(
        (dept) => dept.value === state.department_id
      );

      const fallback = stages.find(
        (stage) => stage.value === state.fallback_stage_id
      );
      const stageCategory = stageCategories.find(
        (cat) => cat.id === state.workflow_stage_category_id
      );

      const single: DataOptionsProps = {
        value: stageCategory?.id,
        label: stageCategory?.name ?? "",
      };

      setSelectedOptions({
        workflow_stage_category: single ?? null,
        department: department ?? null,
        fallback_stage: fallback ?? null,
      });

      setMultipleSelections({
        groups: state.groups ?? [],
        actions: state.actions ?? [],
        recipients: state.recipients ?? [],
      });
    }
  }, [mode, stageCategories, groups, departments, stages, actions, recipients]);

  const renderMultiSelect = (
    label: string,
    options: DataOptionsProps[],
    value: DataOptionsProps | DataOptionsProps[] | null,
    onChange: (newValue: unknown, actionMeta: ActionMeta<unknown>) => void,
    placeholder: string,
    isMulti?: boolean,
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
        isMulti={isMulti}
      />
    </div>
  );

  return (
    <>
      {renderMultiSelect(
        "Workflow Stage Categories",
        formatOptions(stageCategories, "id", "name"),
        selectedOptions.workflow_stage_category,
        handleSelectionChange("workflow_stage_category"),
        "Stage Category"
      )}
      {renderMultiSelect(
        "Departments",
        departments,
        selectedOptions.department,
        handleSelectionChange("department"),
        "Department"
      )}
      {renderMultiSelect(
        "Workflow Stages",
        stages,
        selectedOptions.fallback_stage,
        handleSelectionChange("fallback_stage"),
        "Fallback Stage"
      )}

      <div className="col-md-3 mb-3">
        <TextInput
          label="Name"
          name="name"
          value={state.name}
          onChange={handleChange}
          placeholder="Enter Process Stage Name"
        />
      </div>
      <div className="col-md-3">
        <Select
          label="Access Category"
          name="category"
          defaultValue=""
          defaultCheckDisabled
          valueKey="value"
          labelKey="label"
          value={state.category}
          onChange={handleChange}
          options={[
            { value: "staff", label: "Staff" },
            { value: "third-party", label: "Third Party" },
            { value: "system", label: "System" },
          ]}
          size="sm"
        />
      </div>
      <div className="col-md-3">
        <Select
          label="Can Appeal"
          name="can_appeal"
          defaultValue={999}
          defaultCheckDisabled
          valueKey="value"
          labelKey="label"
          value={state.can_appeal}
          onChange={handleChange}
          options={[
            { value: 1, label: "Yes" },
            { value: 0, label: "No" },
          ]}
          size="sm"
        />
      </div>
      <div className="col-md-3">
        <Select
          label="Append Signature"
          name="append_signature"
          defaultValue={999}
          defaultCheckDisabled
          valueKey="value"
          labelKey="label"
          value={state.append_signature}
          onChange={handleChange}
          options={[
            { value: 1, label: "Yes" },
            { value: 0, label: "No" },
          ]}
          size="sm"
        />
      </div>
      {renderMultiSelect(
        "Access Groups",
        groups,
        multipleSelections.groups,
        handleMultipleSelectionChange("groups"),
        "Access groups",
        true
      )}
      {renderMultiSelect(
        "Can Perform Actions",
        actions,
        multipleSelections.actions,
        handleMultipleSelectionChange("actions"),
        "Actions",
        true
      )}
      {renderMultiSelect(
        "Mail Distribution",
        recipients,
        multipleSelections.recipients,
        handleMultipleSelectionChange("recipients"),
        "Recipients",
        true
      )}
      <div className="col-md-3 mb-3">
        <Select
          label="Flow"
          name="flow"
          defaultValue=""
          defaultCheckDisabled
          valueKey="value"
          labelKey="label"
          value={state.flow}
          onChange={handleChange}
          options={[
            { value: "process", label: "Process" },
            { value: "tracker", label: "Tracker" },
            { value: "both", label: "Both" },
          ]}
          size="sm"
        />
      </div>
      <div className="col-md-3 mb-3">
        <Select
          label="Is Displayed"
          name="isDisplayed"
          defaultValue={999}
          defaultCheckDisabled
          valueKey="value"
          labelKey="label"
          value={state.isDisplayed}
          onChange={handleChange}
          options={[
            { value: 1, label: "Yes" },
            { value: 0, label: "No" },
          ]}
          size="sm"
        />
      </div>
    </>
  );
};

export default WorkflowStage;
