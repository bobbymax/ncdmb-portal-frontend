/* eslint-disable react-hooks/exhaustive-deps */
import { DepartmentResponseData } from "app/Repositories/Department/data";
import { GroupResponseData } from "app/Repositories/Group/data";
import { MailingListResponseData } from "app/Repositories/MailingList/data";
import { FormPageComponentProps } from "bootstrap";
import React, { useCallback, useEffect, useState } from "react";
import MultiSelect, { DataOptionsProps } from "../components/forms/MultiSelect";
import { formatOptions } from "app/Support/Helpers";
import { ActionMeta } from "react-select";
import TextInput from "../components/forms/TextInput";

interface DependencyProps {
  groups: GroupResponseData[];
  departments: DepartmentResponseData[];
}

const MailingList: React.FC<
  FormPageComponentProps<MailingListResponseData>
> = ({
  state,
  setState,
  handleChange,
  handleReactSelect,
  mode,
  dependencies,
  loading,
}) => {
  const [departments, setDepartments] = useState<DataOptionsProps[]>([]);
  const [groups, setGroups] = useState<DataOptionsProps[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<{
    group: DataOptionsProps | null;
    department: DataOptionsProps | null;
  }>({
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
      const { groups = [], departments = [] } = dependencies as DependencyProps;

      const newDepts = [
        { value: 0, label: "Originating Department" },
        ...formatOptions(departments, "id", "abv"),
      ];

      setDepartments(newDepts);
      setGroups(formatOptions(groups, "id", "name"));
    }
  }, [dependencies]);

  useEffect(() => {
    if (mode === "update" && groups.length > 0 && departments.length > 0) {
      setSelectedOptions({
        department:
          departments.find((dept) => dept.value === state.department_id) ??
          null,
        group: groups.find((group) => group.value === state.group_id) ?? null,
      });
    }
  }, [mode, groups, departments]);

  const renderMultiSelect = (
    label: string,
    options: DataOptionsProps[],
    value: DataOptionsProps | null,
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
        "Groups",
        groups,
        selectedOptions.group,
        handleSelectionChange("group"),
        "Group"
      )}
      {renderMultiSelect(
        "Departments",
        departments,
        selectedOptions.department,
        handleSelectionChange("department"),
        "Department"
      )}
      <div className="col-md-4 mb-3">
        <TextInput
          label="Name"
          name="name"
          value={state.name}
          onChange={handleChange}
          placeholder="Enter Name"
        />
      </div>
    </>
  );
};

export default MailingList;
