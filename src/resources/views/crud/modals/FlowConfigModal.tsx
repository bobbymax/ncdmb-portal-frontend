import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ProcessFlowConfigProps,
  ProcessFlowType,
  WorkflowDependencyProps,
} from "../DocumentWorkflow";
import { useModal, WorkflowModalProps } from "app/Context/ModalContext";
import MultiSelect, {
  DataOptionsProps,
} from "../../components/forms/MultiSelect";
import { ActionMeta } from "react-select";
import { formatOptions } from "app/Support/Helpers";
import Select from "../../components/forms/Select";
import { SignatoryType } from "app/Repositories/Signatory/data";
import Button from "../../components/forms/Button";

const FlowConfigModal: React.FC<WorkflowModalProps<ProcessFlowType>> = ({
  title,
  modalState,
  data,
  isUpdating,
  handleSubmit,
  type,
  dependencies,
  extras,
}) => {
  const { getModalState, updateModalState } = useModal();
  const state: ProcessFlowConfigProps[ProcessFlowType] = getModalState(type);

  const [selectedOptions, setSelectedOptions] = useState<{
    workflow_stage: DataOptionsProps | null;
    group: DataOptionsProps | null;
    department: DataOptionsProps | null;
    carder: DataOptionsProps | null;
    user: DataOptionsProps | null;
  }>({
    workflow_stage: null,
    group: null,
    department: null,
    carder: null,
    user: null,
  });

  const handleSelectionChange = useCallback(
    (key: keyof typeof selectedOptions) => (newValue: unknown) => {
      const updatedValue = newValue as DataOptionsProps;
      setSelectedOptions((prev) => ({ ...prev, [key]: updatedValue }));

      updateModalState(type, {
        ...state,
        [`${key}_id`]: updatedValue.value,
      });
    },
    [updateModalState]
  );

  const {
    groups = [],
    departments = [],
    users = [],
    carders = [],
    workflowStages = [],
  } = useMemo(() => dependencies as WorkflowDependencyProps, [dependencies]);

  useEffect(() => {
    if (data) {
      updateModalState(type, data);
      setSelectedOptions({
        workflow_stage:
          formatOptions(workflowStages, "id", "name").find(
            (option) => option.value === data.workflow_stage_id
          ) ?? null,
        group:
          formatOptions(groups, "id", "name").find(
            (option) => option.value === data.group_id
          ) ?? null,
        department:
          formatOptions(departments, "id", "abv", true).find(
            (option) => option.value === data.department_id
          ) ?? null,
        carder:
          formatOptions(carders, "id", "name").find(
            (option) => option.value === data.carder_id
          ) ?? null,
        user:
          formatOptions(users, "id", "name", true).find(
            (option) => option.value === data.user_id
          ) ?? null,
      });
    }
  }, [data]);

  const renderMultiSelect = (
    label: string,
    options: DataOptionsProps[],
    value: DataOptionsProps | null,
    onChange: (newValue: unknown, actionMeta: ActionMeta<unknown>) => void,
    placeholder: string,
    isDisabled: boolean = false,
    grid: number = 6,
    isMulti: boolean = false,
    description: string = ""
  ) => (
    <div className={`col-md-${grid} mb-2`}>
      <MultiSelect
        label={label}
        options={options}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        isSearchable
        isDisabled={isDisabled}
        description={description}
        aria-label={`Select ${label.toLowerCase()}`}
        aria-describedby={`${value}-${label.toLowerCase()}-description`}
        isMulti={isMulti}
      />
      {description && (
        <div
          id={`${value}-${label.toLowerCase()}-description`}
          className="sr-only"
        >
          {description}
        </div>
      )}
    </div>
  );

  return (
    <div className="row">
      {renderMultiSelect(
        "Desk",
        formatOptions(workflowStages, "id", "name"),
        selectedOptions.workflow_stage,
        handleSelectionChange("workflow_stage"),
        "Select Workflow Stage",
        false,
        6
      )}
      {renderMultiSelect(
        "Group",
        formatOptions(groups, "id", "name"),
        selectedOptions.group,
        handleSelectionChange("group"),
        "Select Group",
        false,
        6
      )}
      {renderMultiSelect(
        "Department",
        formatOptions(departments, "id", "abv", true),
        selectedOptions.department,
        handleSelectionChange("department"),
        "Select Department",
        false,
        4
      )}
      {renderMultiSelect(
        "Carder",
        formatOptions(carders, "id", "name"),
        selectedOptions.carder,
        handleSelectionChange("carder"),
        "Select Carder",
        false,
        4
      )}
      <div className="col-md-4 mb-3">
        <Select
          label="Signatory Type"
          name="signatory_type"
          options={[
            { value: "owner", label: "Owner" },
            { value: "witness", label: "Witness" },
            { value: "approval", label: "Approval" },
            { value: "authorised", label: "Authorised" },
            { value: "attestation", label: "Attestation" },
            { value: "auditor", label: "Auditor" },
            { value: "other", label: "Other" },
            { value: "initiator", label: "Initiator" },
            { value: "vendor", label: "Vendor" },
          ]}
          value={state?.signatory_type}
          onChange={(e) => {
            updateModalState(type, {
              ...state,
              signatory_type: e.target.value as SignatoryType,
            });
          }}
          defaultValue=""
          valueKey="value"
          labelKey="label"
          defaultCheckDisabled
          size="xl"
        />
      </div>
      {renderMultiSelect(
        "Signatory",
        formatOptions(users, "id", "name", true),
        selectedOptions.user,
        handleSelectionChange("user"),
        "Select Signatory",
        false,
        4
      )}

      <div className="col-md-4 mb-3">
        <Select
          label="Should be signed"
          name="should_be_signed"
          options={[
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ]}
          value={state?.should_be_signed}
          onChange={(e) => {
            updateModalState(type, {
              ...state,
              should_be_signed: e.target.value as "yes" | "no",
            });
          }}
          defaultValue=""
          valueKey="value"
          labelKey="label"
          defaultCheckDisabled
          size="xl"
        />
      </div>
      <div className="col-md-4 mb-3">
        <Select
          label="Permission"
          name="permission"
          options={[
            { value: "r", label: "Pass" },
            { value: "rw", label: "Manage" },
            { value: "rwx", label: "Manage & Query" },
          ]}
          value={state?.permission}
          onChange={(e) => {
            updateModalState(type, {
              ...state,
              permission: e.target.value as "r" | "rw" | "rwx",
            });
          }}
          defaultValue=""
          valueKey="value"
          labelKey="label"
          defaultCheckDisabled
          size="xl"
        />
      </div>
      <div className="col-md-12 mb-3 d-flex justify-content-end mt-4">
        <Button
          label="Create Flow"
          handleClick={() => {
            handleSubmit(type, state, isUpdating ? "update" : "store");
            updateModalState(type, {});
          }}
          size="sm"
          variant="dark"
          isDisabled={
            !state ||
            !selectedOptions.workflow_stage ||
            !selectedOptions.group ||
            !state.permission
          }
          icon="ri-equalizer-line"
        />
      </div>
    </div>
  );
};

export default FlowConfigModal;
