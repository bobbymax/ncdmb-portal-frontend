import { DepartmentResponseData } from "@/app/Repositories/Department/data";
import { InventoryLocationResponseData } from "@/app/Repositories/InventoryLocation/data";
import { FormPageComponentProps } from "bootstrap";
import { formatOptions } from "app/Support/Helpers";
import React, { useEffect, useMemo, useState } from "react";
import MultiSelect, { DataOptionsProps } from "../components/forms/MultiSelect";
import Select from "../components/forms/Select";
import TextInput from "../components/forms/TextInput";

interface DependencyProps {
  departments: DepartmentResponseData[];
  locations: InventoryLocationResponseData[];
}

const InventoryLocation: React.FC<
  FormPageComponentProps<InventoryLocationResponseData>
> = ({ state, setState, handleChange, dependencies, mode }) => {
  const { departments = [], locations = [] } = useMemo(
    () => (dependencies || {}) as DependencyProps,
    [dependencies]
  );

  const [departmentOption, setDepartmentOption] =
    useState<DataOptionsProps | null>(null);
  const [parentOption, setParentOption] =
    useState<DataOptionsProps | null>(null);

  useEffect(() => {
    if (mode === "update") {
      if (state.department_id) {
        const option = formatOptions(departments, "id", "name").find(
          (dept) => dept.value === state.department_id
        );
        setDepartmentOption(option || null);
      }
      if (state.parent_id) {
        const option = formatOptions(locations, "id", "name").find(
          (loc) => loc.value === state.parent_id
        );
        setParentOption(option || null);
      }
    }
  }, [mode, state.department_id, state.parent_id, departments, locations]);

  return (
    <>
      <div className="col-md-6 mb-3">
        <TextInput
          label="Location Name"
          name="name"
          value={state.name}
          onChange={handleChange}
          placeholder="e.g. Main Warehouse"
        />
      </div>

      <div className="col-md-3 mb-3">
        <TextInput
          label="Short Code"
          name="code"
          value={state.code}
          onChange={handleChange}
          placeholder="AUTO"
          maxLength={12}
        />
      </div>

      <div className="col-md-3 mb-3">
        <Select
          label="Location Type"
          name="type"
          value={state.type}
          onChange={handleChange}
          options={[
            { label: "Warehouse", value: "warehouse" },
            { label: "Project Site", value: "site" },
            { label: "Vehicle", value: "vehicle" },
            { label: "Office", value: "office" },
          ]}
          valueKey="value"
          labelKey="label"
          defaultValue="warehouse"
          defaultCheckDisabled
        />
      </div>

      <div className="col-md-6 mb-3">
        <MultiSelect
          label="Owning Department"
          placeholder="Select department"
          options={formatOptions(departments, "id", "name")}
          value={departmentOption}
          onChange={(option) => {
            const value = option as DataOptionsProps;
            setDepartmentOption(value);
            setState?.((prev) => ({
              ...prev,
              department_id: value?.value ?? null,
            }));
          }}
          isSearchable
        />
      </div>

      <div className="col-md-6 mb-3">
        <MultiSelect
          label="Parent Location"
          placeholder="Optional parent location"
          options={formatOptions(
            locations.filter((loc) => loc.id !== state.id),
            "id",
            "name"
          )}
          value={parentOption}
          onChange={(option) => {
            const value = option as DataOptionsProps;
            setParentOption(value);
            setState?.((prev) => ({
              ...prev,
              parent_id: value?.value ?? null,
            }));
          }}
          isClearable
          isSearchable
        />
      </div>
    </>
  );
};

export default InventoryLocation;
