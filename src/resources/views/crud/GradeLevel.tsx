import { GradeLevelResponseData } from "app/Repositories/GradeLevel/data";
import { FormPageComponentProps } from "bootstrap";
import React from "react";
import TextInput from "../components/forms/TextInput";
import Select from "../components/forms/Select";

const GradeLevel: React.FC<FormPageComponentProps<GradeLevelResponseData>> = ({
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
          placeholder="Enter Grade Level Name"
        />
      </div>
      <div className="col-md-4 mb-3">
        <TextInput
          label="Key"
          name="key"
          value={state.key}
          onChange={handleChange}
          isDisabled={loading}
          placeholder="Enter Grade Level ABV"
        />
      </div>
      <div className="col-md-8 mb-3">
        <Select
          label="Type"
          name="type"
          valueKey="value"
          labelKey="label"
          defaultValue=""
          defaultCheckDisabled
          value={state.type}
          onChange={handleChange}
          isDisabled={loading}
          options={[
            { label: "Board", value: "board" },
            { label: "System", value: "system" },
          ]}
        />
      </div>
    </>
  );
};

export default GradeLevel;
