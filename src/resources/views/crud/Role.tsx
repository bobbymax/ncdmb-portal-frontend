import { FormPageComponentProps } from "bootstrap";
import React from "react";
import TextInput from "../components/forms/TextInput";

const Role: React.FC<FormPageComponentProps> = ({
  state,
  handleChange,
  loading,
  error,
  dependencies,
  mode,
}) => {
  return (
    <>
      <div className="col-md-12">
        <TextInput
          label="Name"
          name="name"
          value={state.name}
          onChange={handleChange}
          isDisabled={loading}
          placeholder="Enter Role Name"
        />
      </div>
    </>
  );
};

export default Role;
