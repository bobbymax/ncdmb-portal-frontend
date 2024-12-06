import { DocumentRequirementResponseData } from "app/Repositories/DocumentRequirement/data";
import { FormPageComponentProps } from "bootstrap";
import React from "react";
import TextInput from "../components/forms/TextInput";

const DocumentRequirement: React.FC<
  FormPageComponentProps<DocumentRequirementResponseData>
> = ({ state, handleChange, loading }) => {
  return (
    <>
      <div className="col-md-12 mb-4">
        <TextInput
          label="Name"
          name="name"
          value={state.name}
          onChange={handleChange}
          isDisabled={loading}
          placeholder="Enter Document Requirement Name"
        />
      </div>
    </>
  );
};

export default DocumentRequirement;
