import { DepartmentResponseData } from "app/Repositories/Department/data";
import { FormPageComponentProps } from "bootstrap";
import React, { useCallback, useEffect, useState } from "react";
import TextInput from "../components/forms/TextInput";
import Select from "../components/forms/Select";
import { UserResponseData } from "@/app/Repositories/User/data";
import { formatOptions } from "app/Support/Helpers";
import MultiSelect, { DataOptionsProps } from "../components/forms/MultiSelect";

interface DependencyProps {
  departments: DepartmentResponseData[];
  users: UserResponseData[];
}

const Department: React.FC<FormPageComponentProps<DepartmentResponseData>> = ({
  state,
  setState,
  handleChange,
  dependencies,
  mode,
}) => {
  const [parents, setParents] = useState<DataOptionsProps[]>([]);
  const [signatories, setSignatories] = useState<DataOptionsProps[]>([]);

  const [selectedOptions, setSelectedOptions] = useState<{
    signatory_staff: DataOptionsProps | null;
    alternate_signatory_staff: DataOptionsProps | null;
    bco: DataOptionsProps | null;
    bo: DataOptionsProps | null;
    director: DataOptionsProps | null;
  }>({
    signatory_staff: null,
    alternate_signatory_staff: null,
    bco: null,
    bo: null,
    director: null,
  });

  const handleSelectionChange = useCallback(
    (key: keyof typeof selectedOptions) => (newValue: unknown) => {
      const updatedValue = newValue as DataOptionsProps;

      setSelectedOptions((prev) => ({ ...prev, [key]: updatedValue }));

      if (setState) {
        if (key === "signatory_staff" || key === "alternate_signatory_staff") {
          setState((prev) => ({ ...prev, [`${key}_id`]: updatedValue.value }));
        } else {
          setState((prev) => ({ ...prev, [key]: updatedValue.value }));
        }
      }
    },
    [setState]
  );

  useEffect(() => {
    if (dependencies) {
      const { departments = [], users = [] } = dependencies as DependencyProps;

      const options = formatOptions(
        departments,
        "id",
        "abv",
        true,
        false,
        "NONE"
      );

      setParents(options);
      setSignatories(formatOptions(users, "id", "name", true, false, "NONE"));
    }
  }, [dependencies]);

  useEffect(() => {
    if (mode === "update" && signatories.length > 0) {
      setSelectedOptions({
        signatory_staff:
          signatories.find((user) => user.value === state.signatory_staff_id) ??
          null,
        alternate_signatory_staff:
          signatories.find(
            (user) => user.value === state.alternate_signatory_staff_id
          ) ?? null,
        bco: signatories.find((user) => user.value === state.bco) ?? null,
        bo: signatories.find((user) => user.value === state.bo) ?? null,
        director:
          signatories.find((user) => user.value === state.director) ?? null,
      });
    }
  }, [
    mode,
    signatories,
    state.signatory_staff_id,
    state.alternate_signatory_staff_id,
  ]);

  // console.log(state);

  return (
    <>
      <div className="col-md-9 mb-3">
        <TextInput
          label="Name"
          value={state.name}
          name="name"
          onChange={handleChange}
          placeholder="Enter Department Name"
        />
      </div>
      <div className="col-md-3 mb-3">
        <TextInput
          label="Abbreviation"
          value={state.abv}
          name="abv"
          onChange={handleChange}
          placeholder="Enter Department Abv"
        />
      </div>
      <div className="col-md-4 mb-3">
        <Select
          label="DDD Type"
          value={state.type}
          name="type"
          onChange={handleChange}
          options={[
            { label: "Directorate", value: "directorate" },
            { label: "Division", value: "division" },
            { label: "Department", value: "department" },
            { label: "Unit", value: "unit" },
          ]}
          valueKey="value"
          labelKey="label"
          defaultValue=""
          defaultCheckDisabled
        />
      </div>
      <div className="col-md-4 mb-3">
        <Select
          label="Parent"
          value={state.parentId}
          name="parentId"
          onChange={handleChange}
          options={parents}
          valueKey="value"
          labelKey="label"
          defaultValue={9999}
          defaultCheckDisabled
        />
      </div>
      <div className="col-md-4 mb-3">
        <Select
          label="Disable Department"
          value={state.is_blocked}
          name="is_blocked"
          onChange={handleChange}
          options={[
            { label: "Yes", value: 1 },
            { label: "No", value: 0 },
          ]}
          valueKey="value"
          labelKey="label"
          defaultValue={999}
          defaultCheckDisabled
        />
      </div>
      <div className="col-md-6 mb-3">
        <MultiSelect
          label="Signatory"
          options={signatories}
          value={selectedOptions.signatory_staff}
          onChange={handleSelectionChange("signatory_staff")}
          placeholder="Signatory"
          isSearchable
        />
      </div>
      <div className="col-md-6 mb-3">
        <MultiSelect
          label="Alternate Signatory"
          options={signatories}
          value={selectedOptions.alternate_signatory_staff}
          onChange={handleSelectionChange("alternate_signatory_staff")}
          placeholder="Alternate Signatory"
          isSearchable
        />
      </div>
      <div className="col-md-4 mb-3">
        <MultiSelect
          label="BCO"
          options={signatories}
          value={selectedOptions.bco}
          onChange={handleSelectionChange("bco")}
          placeholder="Budget Controller"
          isSearchable
        />
      </div>
      <div className="col-md-4 mb-3">
        <MultiSelect
          label="BO"
          options={signatories}
          value={selectedOptions.bo}
          onChange={handleSelectionChange("bo")}
          placeholder="Budget Owner"
          isSearchable
        />
      </div>
      <div className="col-md-4 mb-3">
        <MultiSelect
          label="Director"
          options={signatories}
          value={selectedOptions.director}
          onChange={handleSelectionChange("director")}
          placeholder="Director"
          isSearchable
        />
      </div>
    </>
  );
};

export default Department;
