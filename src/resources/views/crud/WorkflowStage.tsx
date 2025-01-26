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
import { DocumentTypeResponseData } from "app/Repositories/DocumentType/data";
import { DocumentCategoryResponseData } from "app/Repositories/DocumentCategory/data";
import Select from "../components/forms/Select";

interface DependencyProps {
  departments: DepartmentResponseData[];
  groups: GroupResponseData[];
  stageCategories: StageCategoryResponseData[];
  workflowStages: WorkflowStageResponseData[];
  documentTypes: DocumentTypeResponseData[];
  documentCategories: DocumentCategoryResponseData[];
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

  const [selectedOptions, setSelectedOptions] = useState<{
    workflow_stage_category: DataOptionsProps | null;
    group: DataOptionsProps | null;
    department: DataOptionsProps | null;
  }>({
    workflow_stage_category: null,
    group: null,
    department: null,
  });

  const handleSelectionChange = useCallback(
    (key: "workflow_stage_category" | "group" | "department") =>
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
      } = dependencies as DependencyProps;

      const listOfDepartments = formatOptions(departments, "id", "abv");

      setStageCategories(stageCategories);

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
      state.group_id > 0 &&
      stageCategories.length > 0 &&
      departments.length > 0 &&
      groups.length > 0
    ) {
      const department = departments.find(
        (dept) => dept.value === state.department_id
      );

      const group = groups.find((group) => group.value === state.group_id);
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
        group: group ?? null,
      });
    }
  }, [mode, stageCategories, groups, departments]);

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
        "Groups",
        groups,
        selectedOptions.group,
        handleSelectionChange("group"),
        "Group"
      )}

      <div className="col-md-8 mb-3">
        <TextInput
          label="Name"
          name="name"
          value={state.name}
          onChange={handleChange}
          placeholder="Enter Process Stage Name"
        />
      </div>
      <div className="col-md-4">
        <Select
          label="Status"
          name="status"
          defaultValue=""
          defaultCheckDisabled
          valueKey="value"
          labelKey="label"
          value={state.status}
          onChange={handleChange}
          options={[
            { value: "passed", label: "Passed" },
            { value: "failed", label: "Failed" },
            { value: "attend", label: "Attend" },
            { value: "appeal", label: "Appeal" },
            { value: "stalled", label: "Stalled" },
            { value: "cancelled", label: "Cancelled" },
            { value: "complete", label: "Complete" },
          ]}
        />
      </div>
      <div className="col-md-4">
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
        />
      </div>
      <div className="col-md-4">
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
        />
      </div>
      <div className="col-md-4">
        <Select
          label="Should Upload Document"
          name="should_upload"
          defaultValue={999}
          defaultCheckDisabled
          valueKey="value"
          labelKey="label"
          value={state.should_upload}
          onChange={handleChange}
          options={[
            { value: 1, label: "Yes" },
            { value: 0, label: "No" },
          ]}
        />
      </div>
    </>
  );
};

export default WorkflowStage;
