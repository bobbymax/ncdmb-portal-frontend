import { GroupResponseData } from "app/Repositories/Group/data";
import { FormPageComponentProps } from "bootstrap";
import React from "react";
import TextInput from "../components/forms/TextInput";
import Select from "../components/forms/Select";

const Group: React.FC<FormPageComponentProps<GroupResponseData>> = ({
  state,
  handleChange,
  loading,
}) => {
  return (
    <>
      <div className="col-md-12 mb-3">
        <TextInput
          name="name"
          label="Name"
          value={state.name}
          onChange={handleChange}
          isDisabled={loading}
          placeholder="Enter Group Name"
        />
      </div>
      <div className="col-md-7 mb-3">
        <TextInput
          name="rank"
          label="Rank"
          type="number"
          value={state.rank}
          min={0}
          max={13}
          onChange={handleChange}
          isDisabled={loading}
          placeholder="Enter Group Rank"
        />
      </div>
      <div className="col-md-5 mb-3">
        <Select
          name="scope"
          label="Scope"
          valueKey="value"
          labelKey="label"
          defaultValue=""
          defaultCheckDisabled
          value={state.scope}
          onChange={handleChange}
          isDisabled={loading}
          options={[
            { label: "Directorate", value: "directorate" },
            { label: "Division", value: "division" },
            { label: "Department", value: "department" },
            { label: "Board", value: "board" },
            { label: "Collaborations", value: "collaborations" },
            { label: "Personal", value: "personal" },
          ]}
        />
      </div>
    </>
  );
};

export default Group;
