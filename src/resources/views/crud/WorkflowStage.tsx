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
import { DocumentRequirementResponseData } from "app/Repositories/DocumentRequirement/data";
import { StageCategoryResponseData } from "app/Repositories/StageCategory/data";
import Select from "../components/forms/Select";

interface DependencyProps {
  departments: DepartmentResponseData[];
  groups: GroupResponseData[];
  stageCategories: StageCategoryResponseData[];
  documentRequirements: DocumentRequirementResponseData[];
  workflowStages: WorkflowStageResponseData[];
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
  const [workflowStages, setWorkflowStages] = useState<DataOptionsProps[]>([]);
  const [documentRequired, setDocumentRequired] = useState<
    DocumentRequirementResponseData[]
  >([]);
  const [documentActions, setDocumentActions] = useState<DataOptionsProps[]>(
    []
  );

  const [selectedArrayOptions, setSelectedArrayOptions] = useState<{
    selectedDocumentsRequired: DataOptionsProps[];
    recipients: DataOptionsProps[];
    selectedActions: DataOptionsProps[];
  }>({
    selectedDocumentsRequired: [],
    recipients: [],
    selectedActions: [],
  });

  const [selectedOptions, setSelectedOptions] = useState<{
    workflow_stage_category: DataOptionsProps | null;
    group: DataOptionsProps | null;
    department: DataOptionsProps | null;
    assistant_group: DataOptionsProps | null;
    fallback_stage: DataOptionsProps | null;
  }>({
    workflow_stage_category: null,
    group: null,
    department: null,
    assistant_group: null,
    fallback_stage: null,
  });

  const handleSelectionChange = useCallback(
    (
        key:
          | "workflow_stage_category"
          | "group"
          | "department"
          | "assistant_group"
          | "fallback_stage"
      ) =>
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

  const handleSelectionArrayChange = useCallback(
    (key: "selectedDocumentsRequired" | "recipients" | "selectedActions") =>
      (newValue: unknown, actionMeta: ActionMeta<unknown>) => {
        handleReactSelect(newValue, actionMeta, (value) => {
          const updatedValue = value as DataOptionsProps[];
          setSelectedArrayOptions((prev) => ({ ...prev, [key]: updatedValue }));
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

  useEffect(() => {
    if (state.workflow_stage_category_id > 0) {
      const stage = stageCategories.find(
        (stage) => stage.id === Number(state.workflow_stage_category_id)
      );

      if (stage) {
        const actions = stage.actions;
        setDocumentActions(formatOptions(actions, "id", "name"));
      }
    }
  }, [state.workflow_stage_category_id]);

  useEffect(() => {
    if (dependencies) {
      const {
        stageCategories = [],
        departments = [],
        groups = [],
        documentRequirements = [],
        workflowStages = [],
      } = dependencies as DependencyProps;

      const listOfDepartments = formatOptions(departments, "id", "abv");

      setStageCategories(stageCategories);

      setDepartments([
        { value: 0, label: "Originating Department" },
        ...listOfDepartments,
      ]);
      setGroups(formatOptions(groups, "id", "name"));
      setDocumentRequired(documentRequirements);
      // setWorkflowStageCategories(stageCategories);
      setWorkflowStages([
        { value: 0, label: "None" },
        ...formatOptions(workflowStages, "id", "name"),
      ]);
    }
  }, [dependencies]);

  useEffect(() => {
    if (
      mode === "update" &&
      state.group_id > 0 &&
      stageCategories.length > 0 &&
      departments.length > 0 &&
      groups.length > 0 &&
      workflowStages.length > 0
    ) {
      const department = departments.find(
        (dept) => dept.value === state.department_id
      );
      const group = groups.find((group) => group.value === state.group_id);
      const assistant_group = groups.find(
        (group) => group.value === state.assistant_group_id
      );
      const stageCategory = stageCategories.find(
        (cat) => cat.id === state.workflow_stage_category_id
      );

      const fallBackStage = workflowStages.find(
        (stage) => stage.value === state.fallback_stage_id
      );

      const requirements = formatOptions(
        state.documentsRequired ?? [],
        "id",
        "name"
      );

      const selectedActions = formatOptions(state.actions, "id", "name");

      const single: DataOptionsProps = {
        value: stageCategory?.id,
        label: stageCategory?.name ?? "",
      };

      setSelectedOptions({
        workflow_stage_category: single ?? null,
        department: department ?? null,
        group: group ?? null,
        assistant_group: assistant_group ?? null,
        fallback_stage: fallBackStage ?? null,
      });

      setSelectedArrayOptions({
        selectedDocumentsRequired: state.selectedDocumentsRequired ?? [],
        recipients: formatOptions(state.recipients, "id", "name") ?? [],
        selectedActions: state.selectedActions ?? [],
      });

      // setActions(state.actions);

      if (setState) {
        setState({
          ...state,
          selectedActions,
          selectedDocumentsRequired: requirements,
        });
      }
    }
  }, [mode, stageCategories, groups, departments, workflowStages]);

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
      <div className="col-md-4 mb-3">
        <Select
          label="Alert Email Recipients"
          name="alert_recipients"
          value={state.alert_recipients}
          onChange={handleChange}
          options={[
            { value: 0, label: "No" },
            { value: 1, label: "Yes" },
          ]}
          valueKey="value"
          labelKey="label"
          defaultValue={999}
          defaultCheckDisabled
        />
      </div>
      {renderMultiSelect(
        "Document Actions",
        documentActions,
        selectedArrayOptions.selectedActions,
        handleSelectionArrayChange("selectedActions"),
        "Action",
        true,
        6
      )}

      {renderMultiSelect(
        "Document's Required",
        formatOptions(documentRequired, "id", "name"),
        selectedArrayOptions.selectedDocumentsRequired,
        handleSelectionArrayChange("selectedDocumentsRequired"),
        "Required Documents",
        true,
        6
      )}
      {renderMultiSelect(
        "Fallback Stage",
        workflowStages,
        selectedOptions.fallback_stage,
        handleSelectionChange("fallback_stage"),
        "Fallback Workflow Stage"
      )}
      {renderMultiSelect(
        "Assistant",
        groups,
        selectedOptions.assistant_group,
        handleSelectionChange("assistant_group"),
        "Assistant"
      )}
      {renderMultiSelect(
        "Email Notification Recipients",
        groups,
        selectedArrayOptions.recipients,
        handleSelectionArrayChange("recipients"),
        "Recipients",
        true
      )}
    </>
  );
};

export default WorkflowStage;
