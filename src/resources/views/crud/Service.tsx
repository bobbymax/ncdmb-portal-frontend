/* eslint-disable react-hooks/exhaustive-deps */
import { FormPageComponentProps } from "bootstrap";
import React, { useEffect } from "react";
import TextInput from "../components/forms/TextInput";
import { generateUniqueString } from "app/Support/Helpers";

const Service: React.FC<FormPageComponentProps> = ({
  state,
  setState,
  handleChange,
  loading,
  error,
  dependencies,
  mode,
}) => {
  useEffect(() => {
    if (setState && mode === "store") {
      setState({
        ...state,
        apiKey: generateUniqueString(),
      });
    }
  }, [mode]);

  return (
    <>
      <div className="col-md-6">
        <TextInput
          label="Application"
          name="application"
          value={state.application}
          onChange={handleChange}
          isDisabled={loading}
          placeholder="Enter Application Service"
        />
      </div>
      <div className="col-md-6">
        <TextInput
          label="URL"
          name="url"
          value={state.url}
          onChange={handleChange}
          isDisabled={loading}
          placeholder="Enter App URL"
        />
      </div>
      <div className="col-md-9">
        <TextInput
          label="Api Key"
          name="apiKey"
          value={state.apiKey}
          onChange={handleChange}
          isDisabled
          placeholder="Api Key Here"
        />
      </div>
      <div className="col-md-3">
        <TextInput
          label="Request Per Day"
          type="number"
          name="max_request_per_day"
          value={state.max_request_per_day}
          onChange={handleChange}
          isDisabled={loading}
        />
      </div>
    </>
  );
};

export default Service;
