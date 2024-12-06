import { WorkflowResponseData } from "app/Repositories/Workflow/data";
import { FormPageComponentProps } from "bootstrap";
import React from "react";
import TextInput from "../components/forms/TextInput";
import Textarea from "../components/forms/Textarea";

const Workflow: React.FC<FormPageComponentProps<WorkflowResponseData>> = ({
  state,
  handleChange,
  loading,
}) => {
  return (
    <>
      <div className="col-md-12 mb-3">
        <TextInput
          label="Name"
          name="name"
          value={state.name}
          onChange={handleChange}
          isDisabled={loading}
          placeholder="Enter Workflow Name Here"
        />
      </div>
      <div className="col-md-12 mb-3">
        <Textarea
          label="Description"
          name="description"
          value={state.description}
          onChange={handleChange}
          isDisabled={loading}
          placeholder="Describe this workflow"
          rows={4}
        />
      </div>
    </>
  );
};

export default Workflow;
