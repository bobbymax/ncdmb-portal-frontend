/* eslint-disable react-hooks/exhaustive-deps */
import { FormPageComponentProps } from "bootstrap";
import React, { ChangeEvent, useEffect, useState } from "react";
import TextInput from "../components/forms/TextInput";
import { RoleResponseData } from "app/Repositories/RoleRepository";
import { ModuleResponseData } from "app/Repositories/ModuleRepository";
import Select from "../components/forms/Select";
import Box from "../components/forms/Box";
import _ from "lodash";

interface DependencyProps {
  roles: RoleResponseData[];
  modules: ModuleResponseData[];
}

const Module: React.FC<FormPageComponentProps> = ({
  state,
  setState,
  handleChange,
  loading,
  error,
  dependencies,
  mode,
}) => {
  const [roles, setRoles] = useState<RoleResponseData[]>([]);
  const [modules, setModules] = useState<ModuleResponseData[]>([]);

  const moduleTypes = [
    { value: "application", label: "Application" },
    { value: "module", label: "Module" },
    { value: "page", label: "Page" },
  ];

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
      const { roles = [], modules: incomingModules = [] } =
        dependencies as DependencyProps;

      const newModule: ModuleResponseData = {
        id: 0,
        name: "None",
        type: "module",
        parent_id: 0,
        path: "/none",
        roles: [],
        icon: "",
      };

      // Create a Set to filter out duplicates based on `id`
      const allModules = [newModule, ...incomingModules];
      const uniqueModuleIds = new Set();
      const uniqueModules = allModules.filter((module) => {
        if (uniqueModuleIds.has(module.id)) {
          return false; // Already exists
        }
        uniqueModuleIds.add(module.id);
        return true; // New entry
      });

      setModules(uniqueModules);
      setRoles(roles);
    }
  }, [dependencies]);

  return (
    <>
      <div className="col-md-7 mb-2">
        <TextInput
          label="Name"
          name="name"
          value={state.name}
          onChange={handleChange}
          isDisabled={loading}
          placeholder="Enter Module Name"
        />
      </div>
      <div className="col-md-5 mb-2">
        <TextInput
          label="Path"
          name="path"
          value={state.path}
          onChange={handleChange}
          isDisabled={loading}
          placeholder="Enter Module Path"
        />
      </div>
      <div className="col-md-4 mb-2">
        <Select
          label="Parent"
          value={state.parent_id}
          defaultValue={9999}
          onChange={handleChange}
          isDisabled={loading}
          options={modules}
          valueKey="id"
          labelKey="name"
          name="parent_id"
        />
      </div>
      <div className="col-md-4 mb-2">
        <Select
          label="Type"
          value={state.type}
          defaultValue=""
          onChange={handleChange}
          isDisabled={loading}
          options={moduleTypes}
          valueKey="value"
          labelKey="label"
          name="type"
        />
      </div>
      <div className="col-md-4 mb-2">
        <TextInput
          label="Icon"
          name="icon"
          value={state.icon}
          onChange={handleChange}
          isDisabled={loading}
          placeholder="Enter Module Icon"
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

export default Module;
