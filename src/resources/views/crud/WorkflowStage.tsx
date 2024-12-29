/* eslint-disable react-hooks/exhaustive-deps */
import { DepartmentResponseData } from "app/Repositories/Department/data";
import { DocumentActionResponseData } from "app/Repositories/DocumentAction/data";
import { GroupResponseData } from "app/Repositories/Group/data";
import { WorkflowResponseData } from "app/Repositories/Workflow/data";
import { WorkflowStageResponseData } from "app/Repositories/WorkflowStage/data";
import { FormPageComponentProps } from "bootstrap";
import React, { useCallback, useEffect, useState } from "react";
import MultiSelect, { DataOptionsProps } from "../components/forms/MultiSelect";
import { formatOptions } from "app/Support/Helpers";
import { ActionMeta } from "react-select";
import TextInput from "../components/forms/TextInput";
import { DocumentRequirementResponseData } from "app/Repositories/DocumentRequirement/data";

interface DependencyProps {
  departments: DepartmentResponseData[];
  groups: GroupResponseData[];
  workflows: WorkflowResponseData[];
  documentActions: DocumentActionResponseData[];
  documentRequirements: DocumentRequirementResponseData[];
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
  const [workflows, setWorkflows] = useState<DataOptionsProps[]>([]);
  const [groups, setGroups] = useState<DataOptionsProps[]>([]);
  const [departments, setDepartments] = useState<DataOptionsProps[]>([]);
  const [documentActions, setDocumentActions] = useState<DataOptionsProps[]>(
    []
  );
  const [requiredDocuments, setRequiredDocuments] = useState<
    DataOptionsProps[]
  >([]);

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
    workflow: DataOptionsProps | null;
    group: DataOptionsProps | null;
    department: DataOptionsProps | null;
  }>({
    workflow: null,
    group: null,
    department: null,
  });

  const [actions, setActions] = useState<DataOptionsProps[]>([]);
  const [requirements, setRequirements] = useState<DataOptionsProps[]>([]);

  const handleSelectionChange = useCallback(
    (key: "workflow" | "group" | "department") =>
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
    if (dependencies) {
      const {
        workflows = [],
        departments = [],
        groups = [],
        documentActions = [],
        documentRequirements = [],
      } = dependencies as DependencyProps;

      const listOfDepartments = formatOptions(departments, "id", "abv");

      setWorkflows(formatOptions(workflows, "id", "name"));

      setDepartments([
        { value: 0, label: "Originating Department" },
        ...listOfDepartments,
      ]);
      setGroups(formatOptions(groups, "id", "name"));
      setDocumentActions(formatOptions(documentActions, "id", "name"));
      setRequiredDocuments(formatOptions(documentRequirements, "id", "name"));
    }
  }, [dependencies]);

  useEffect(() => {
    if (
      mode === "update" &&
      state.workflow_id > 0 &&
      state.group_id > 0 &&
      workflows.length > 0 &&
      departments.length > 0 &&
      groups.length > 0
    ) {
      const department = departments.find(
        (dept) => dept.value === state.department_id
      );
      const group = groups.find((group) => group.value === state.group_id);

      const workflow = workflows.find(
        (workflow) => workflow.value === state.workflow_id
      );

      const requirements = formatOptions(
        state.documentsRequired ?? [],
        "id",
        "name"
      );

      const selectedActions = formatOptions(state.actions, "id", "name");

      setSelectedOptions({
        workflow: workflow ?? null,
        department: department ?? null,
        group: group ?? null,
      });
      setRequirements(requirements);
      setActions(selectedActions);

      if (setState) {
        setState({
          ...state,
          selectedActions,
          selectedDocumentsRequired: requirements,
        });
      }
    }
  }, [mode, workflows, groups, departments]);

  const renderMultiSelect = (
    label: string,
    options: DataOptionsProps[],
    value: DataOptionsProps | DataOptionsProps[] | null,
    onChange: (newValue: unknown, actionMeta: ActionMeta<unknown>) => void,
    placeholder: string,
    isMulti?: boolean,
    grid: number = 4
  ) => (
    <div className={`col-md-${grid} mb-2`}>
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
        "Workflow",
        workflows,
        selectedOptions.workflow,
        handleSelectionChange("workflow"),
        "Workflow"
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

      <div className="col-md-9 mb-2">
        <TextInput
          label="Name"
          name="name"
          value={state.name}
          onChange={handleChange}
          placeholder="Enter Process Stage Name"
        />
      </div>
      <div className="col-md-3 mb-2">
        <TextInput
          label="Order"
          type="number"
          name="order"
          value={state.order}
          onChange={handleChange}
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
        requiredDocuments,
        selectedArrayOptions.selectedDocumentsRequired,
        handleSelectionArrayChange("selectedDocumentsRequired"),
        "Required Documents",
        true,
        6
      )}
      {renderMultiSelect(
        "Email Notification Recipients",
        groups,
        selectedArrayOptions.recipients,
        handleSelectionArrayChange("recipients"),
        "Recipients",
        true,
        12
      )}
    </>
  );
};

export default WorkflowStage;
