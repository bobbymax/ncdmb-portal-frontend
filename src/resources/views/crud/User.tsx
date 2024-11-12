import React, { ChangeEvent, useEffect, useState } from "react";
import { FormPageComponentProps } from "bootstrap";
import TextInput from "../components/forms/TextInput";
import { RoleResponseData } from "app/Repositories/RoleRepository";
import Box from "../components/forms/Box";
import _ from "lodash";

interface DependencyProps {
  roles: RoleResponseData[];
}

const User: React.FC<FormPageComponentProps> = ({
  state,
  setState,
  handleChange,
  loading,
  error,
  dependencies,
  mode,
}) => {
  const [roles, setRoles] = useState<RoleResponseData[]>([]);

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    let newRoles: RoleResponseData[];

    const isChecked = e.target.checked;
    const role = roles.find((rl) => rl.id === Number(value));
    const exists = _.some(state.roles, (obj) => obj.id === role?.id);

    if (isChecked && role && !exists) {
      newRoles = [...state.roles, role];
    } else {
      newRoles = state.roles.filter(
        (rl: RoleResponseData) => rl.id !== Number(role?.id)
      );
    }

    if (setState && role) {
      setState({
        ...state,
        roles: newRoles,
      });
    }
  };

  useEffect(() => {
    if (dependencies) {
      const { roles = [] } = dependencies as DependencyProps;
      setRoles(roles);
    }
  }, [dependencies]);

  return (
    <>
      <div className="col-md-12 mb-2">
        <TextInput
          label="Name"
          name="name"
          value={state.name}
          onChange={handleChange}
          isDisabled={loading}
          placeholder="Enter Module Name"
        />
      </div>
      <div className="col-md-6 mb-2">
        <TextInput
          label="Email"
          name="email"
          value={state.email}
          onChange={handleChange}
          isDisabled={loading}
          placeholder="Enter Staff Email"
        />
      </div>
      <div className="col-md-6 mb-2">
        <TextInput
          label="Staff ID"
          name="staff_no"
          value={state.staff_no}
          onChange={handleChange}
          isDisabled={loading}
          placeholder="Enter Staff ID"
        />
      </div>

      <div className="col-md-12 mb-4">
        <p className="storm-form-label mb-2">Roles</p>
        <div className="custom-panel">
          <div className="row">
            {roles.map((role, i) => (
              <Box
                key={i}
                label={role.name}
                value={role.id}
                name={role.name}
                isChecked={_.some(state.roles, (obj) => obj.id === role?.id)}
                onChange={handleCheckboxChange}
                isDisabled={loading}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default User;
