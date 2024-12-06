import { GroupResponseData } from "app/Repositories/Group/data";
import { FormPageComponentProps } from "bootstrap";
import React from "react";
import TextInput from "../components/forms/TextInput";

const Group: React.FC<FormPageComponentProps<GroupResponseData>> = ({
  state,
  handleChange,
  loading,
}) => {
  return (
    <>
      <div className="col-md-12">
        <TextInput
          name="name"
          label="Name"
          value={state.name}
          onChange={handleChange}
          isDisabled={loading}
          placeholder="Enter Group Name"
        />
      </div>
    </>
  );
};

export default Group;
