import { DepartmentResponseData } from "app/Repositories/Department/data";
import { FormPageComponentProps } from "bootstrap";
import React, { useEffect, useState } from "react";
import TextInput from "../components/forms/TextInput";
import Select from "../components/forms/Select";

interface DependencyProps {
  departments: DepartmentResponseData[];
}

const Department: React.FC<FormPageComponentProps<DepartmentResponseData>> = ({
  state,
  handleChange,
  dependencies,
}) => {
  const [parents, setParents] = useState<{ value: number; label: string }[]>(
    []
  );

  useEffect(() => {
    if (dependencies) {
      const { departments = [] } = dependencies as DependencyProps;

      const options = departments.map((department) => ({
        value: department.id,
        label: department.abv,
      }));

      setParents([{ value: 0, label: "None" }, ...options]);
    }
  }, [dependencies]);

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
    </>
  );
};

export default Department;
