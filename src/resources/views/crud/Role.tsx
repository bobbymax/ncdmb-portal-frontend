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
      <div className="col-md-12 mb-3">
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
        />
      </div>
      <div className="col-md-9 mb-3">
        <TextInput
          label="Name"
          value={state.name}
          name="name"
          onChange={handleChange}
          placeholder="Enter Role Name"
        />
      </div>
      <div className="col-md-3 mb-3">
        <TextInput
          label="Slots"
          type="number"
          value={state.slots}
          name="slots"
          onChange={handleChange}
        />
      </div>
    </>
  );
};

export default Role;
