import { DepartmentResponseData } from "app/Repositories/Department/data";
import { RoleResponseData } from "app/Repositories/Role/data";
import { FormPageComponentProps } from "bootstrap";
import React, { useEffect, useState } from "react";
import Select from "../components/forms/Select";
import TextInput from "../components/forms/TextInput";

interface DependencyProps {
  departments: DepartmentResponseData[];
}

const Role: React.FC<FormPageComponentProps<RoleResponseData>> = ({
  state,
  handleChange,
  dependencies,
}) => {
  const [departments, setDepartments] = useState<
    { value: number; label: string }[]
  >([]);

  useEffect(() => {
    if (dependencies) {
      const { departments = [] } = dependencies as DependencyProps;

      const options = departments.map((department) => ({
        value: department.id,
        label: department.abv,
      }));

      setDepartments(options);
    }
  }, [dependencies]);

  return (
    <>
      <div className="col-md-3 mb-3">
        <Select
          label="Department"
          value={state.department_id}
          name="department_id"
          onChange={handleChange}
          options={departments}
          valueKey="value"
          labelKey="label"
          defaultValue={0}
          defaultCheckDisabled
          size="sm"
        />
      </div>
      <div className="col-md-4 mb-3">
        <TextInput
          label="Name"
          value={state.name}
          name="name"
          onChange={handleChange}
          placeholder="Enter Role Name"
        />
      </div>
      <div className="col-md-2 mb-3">
        <TextInput
          label="Slots"
          type="number"
          value={state.slots}
          name="slots"
          onChange={handleChange}
        />
      </div>
      <div className="col-md-3 mb-3">
        <Select
          label="Access Level"
          value={state.access_level}
          name="access_level"
          onChange={handleChange}
          options={[
            { value: "system", label: "System" },
            { value: "basic", label: "Basic" },
            { value: "operative", label: "Operative" },
            { value: "control", label: "Control" },
            { value: "command", label: "Command" },
            { value: "sovereign", label: "Sovereign" },
          ]}
          valueKey="value"
          labelKey="label"
          defaultValue=""
          defaultCheckDisabled
          size="sm"
        />
      </div>
    </>
  );
};

export default Role;
