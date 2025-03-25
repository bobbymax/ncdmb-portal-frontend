import { DepartmentResponseData } from "app/Repositories/Department/data";
import { GroupResponseData } from "app/Repositories/Group/data";
import { AuthPageResponseData } from "app/Repositories/Page/data";
import { SignatoryResponseData } from "app/Repositories/Signatory/data";
import { FormPageComponentProps } from "bootstrap";
import React, { useCallback, useEffect, useState } from "react";
import MultiSelect, { DataOptionsProps } from "../components/forms/MultiSelect";
import { formatOptions } from "app/Support/Helpers";
import Select from "../components/forms/Select";
import TextInput from "../components/forms/TextInput";

interface DependencyProps {
  pages: AuthPageResponseData[];
  groups: GroupResponseData[];
  departments: DepartmentResponseData[];
}

const Signatory: React.FC<FormPageComponentProps<SignatoryResponseData>> = ({
  state,
  setState,
  handleChange,
  dependencies,
}) => {
  const [pages, setPages] = useState<AuthPageResponseData[]>([]);
  const [groups, setGroups] = useState<GroupResponseData[]>([]);
  const [departments, setDepartments] = useState<DepartmentResponseData[]>([]);

  const [selectedOptions, setSelectedOptions] = useState<{
    page: DataOptionsProps | null;
    group: DataOptionsProps | null;
    department: DataOptionsProps | null;
  }>({
    page: null,
    group: null,
    department: null,
  });

  const handleSelectionChange = useCallback(
    (key: keyof typeof selectedOptions) => (newValue: unknown) => {
      const updatedValue = newValue as DataOptionsProps;
      if (setState) {
        setState((prev) => ({ ...prev, [`${key}_id`]: updatedValue.value }));
      }
      setSelectedOptions((prev) => ({ ...prev, [key]: updatedValue }));
    },
    [setState]
  );

  useEffect(() => {
    if (dependencies) {
      const {
        pages = [],
        groups = [],
        departments = [],
      } = dependencies as DependencyProps;

      setDepartments(departments);
      setGroups(groups);
      setPages(pages);
    }
  }, [dependencies]);

  const renderMultiSelect = (
    label: string,
    options: DataOptionsProps[],
    value: DataOptionsProps | null,
    onChange: (newValue: unknown) => void,
    placeholder: string,
    isDisabled: boolean = false,
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
        isDisabled={isDisabled}
      />
    </div>
  );

  return (
    <>
      {renderMultiSelect(
        "Pages",
        formatOptions(pages, "id", "name"),
        selectedOptions.page,
        handleSelectionChange("page"),
        "Page"
      )}
      {renderMultiSelect(
        "Groups",
        formatOptions(groups, "id", "name"),
        selectedOptions.group,
        handleSelectionChange("group"),
        "Group"
      )}
      {renderMultiSelect(
        "Departments",
        formatOptions(departments, "id", "abv", true),
        selectedOptions.department,
        handleSelectionChange("department"),
        "Department"
      )}
      <div className="col-md-6 mb-3">
        <Select
          label="Type"
          name="type"
          valueKey="value"
          labelKey="label"
          value={state.type}
          onChange={handleChange}
          defaultValue=""
          defaultCheckDisabled
          options={[
            { value: "owner", label: "Owner" },
            { value: "witness", label: "Witness" },
            { value: "approval", label: "Approval" },
            { value: "authorised", label: "Authorised" },
            { value: "attestation", label: "Attestation" },
            { value: "auditor", label: "Auditor" },
            { value: "initiator", label: "Initiator" },
            { value: "vendor", label: "Vendor" },
            { value: "other", label: "Other" },
          ]}
          size="sm"
        />
      </div>
      <div className="col-md-6 mb-3">
        <TextInput
          label="Order"
          name="order"
          value={state.order}
          onChange={handleChange}
          type="number"
        />
      </div>
    </>
  );
};

export default Signatory;
