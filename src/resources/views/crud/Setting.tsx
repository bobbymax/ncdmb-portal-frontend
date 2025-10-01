import { SettingResponseData } from "app/Repositories/Setting/data";
import { FormPageComponentProps } from "bootstrap";
import React, { useEffect } from "react";
import TextInput from "../components/forms/TextInput";
import Select from "../components/forms/Select";
import CodeEditor from "../components/forms/CodeEditor";

const Setting: React.FC<FormPageComponentProps<SettingResponseData>> = ({
  state,
  handleChange,
}) => {
  return (
    <>
      <div className="col-md-6 mb-3">
        <TextInput
          label="Key"
          name="key"
          value={state.key}
          onChange={handleChange}
          placeholder="Enter Setting Key"
        />
      </div>

      <div className="col-md-3 mb-3">
        <TextInput
          label="Order"
          type="number"
          name="order"
          value={state.order}
          onChange={handleChange}
          placeholder="Enter Setting Order"
        />
      </div>
      <div className="col-md-3 mb-3">
        <Select
          label="Grid"
          name="layout"
          value={state.layout}
          onChange={handleChange}
          options={[
            { value: 3, label: "3" },
            { value: 4, label: "4" },
            { value: 5, label: "5" },
            { value: 6, label: "6" },
            { value: 7, label: "7" },
            { value: 8, label: "8" },
            { value: 9, label: "9" },
            { value: 10, label: "10" },
            { value: 11, label: "11" },
            { value: 12, label: "12" },
          ]}
          valueKey="value"
          labelKey="label"
          defaultValue=""
          defaultCheckDisabled
          size="xl"
        />
      </div>

      <div className="col-md-4 mb-3">
        <Select
          label="Input Type"
          name="input_type"
          value={state.input_type}
          onChange={handleChange}
          options={[
            { value: "text", label: "Text" },
            { value: "number", label: "Number" },
            { value: "email", label: "Email" },
            { value: "password", label: "Password" },
            { value: "date", label: "Date" },
            { value: "checkbox", label: "Checkbox" },
            { value: "radio", label: "Radio" },
            { value: "select", label: "Select" },
            { value: "textarea", label: "Textarea" },
            { value: "file", label: "File" },
            { value: "multi-select", label: "Multi Select" },
          ]}
          valueKey="value"
          labelKey="label"
          defaultValue=""
          defaultCheckDisabled
          size="xl"
        />
      </div>
      <div className="col-md-4 mb-3">
        <Select
          label="Input Data Type"
          name="input_data_type"
          value={state.input_data_type}
          onChange={handleChange}
          options={[
            { value: "string", label: "String" },
            { value: "number", label: "Number" },
            { value: "boolean", label: "Boolean" },
            { value: "object", label: "Object" },
            { value: "array", label: "Array" },
          ]}
          valueKey="value"
          labelKey="label"
          defaultValue=""
          defaultCheckDisabled
          size="xl"
        />
      </div>
      <div className="col-md-4 mb-3">
        <Select
          label="Access Group"
          name="access_group"
          value={state.access_group}
          onChange={handleChange}
          options={[
            { value: "public", label: "Public" },
            { value: "admin", label: "Admin" },
          ]}
          valueKey="value"
          labelKey="label"
          defaultValue=""
          defaultCheckDisabled
          size="xl"
        />
      </div>
      <div className="col-md-12 mb-3">
        <CodeEditor
          label="Configuration"
          name="configuration"
          value={
            typeof state.configuration === "string"
              ? state.configuration
              : JSON.stringify(state.configuration, null, 2)
          }
          onChange={(value) => {
            try {
              // Try to parse as JSON first
              const parsedValue = JSON.parse(value);
              handleChange({
                target: {
                  name: "configuration",
                  value: parsedValue,
                },
              } as React.ChangeEvent<HTMLInputElement>);
            } catch {
              // If parsing fails, store as string
              handleChange({
                target: {
                  name: "configuration",
                  value: value,
                },
              } as React.ChangeEvent<HTMLInputElement>);
            }
          }}
          language="json"
          height="400px"
          placeholder="Enter configuration as JSON..."
          size="lg"
        />
      </div>
    </>
  );
};

export default Setting;
