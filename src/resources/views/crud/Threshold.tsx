import { ThresholdResponseData } from "app/Repositories/Threshold/data";
import { FormPageComponentProps } from "bootstrap";
import React, { useEffect, useState } from "react";
import TextInput from "../components/forms/TextInput";
import Select from "../components/forms/Select";

const Threshold: React.FC<FormPageComponentProps<ThresholdResponseData>> = ({
  state,
  handleChange,
  dependencies,
}) => {
  return (
    <>
      <div className="col-md-12 mb-3">
        <TextInput
          label="Name"
          value={state.name}
          name="name"
          onChange={handleChange}
          placeholder="Enter Threshold Name"
        />
      </div>
      <div className="col-md-6 mb-3">
        <TextInput
          label="Amount"
          value={state.amount}
          name="amount"
          onChange={handleChange}
          placeholder="Enter Threshold Amount"
        />
      </div>
      <div className="col-md-6 mb-3">
        <Select
          label="Type"
          valueKey="value"
          labelKey="label"
          name="type"
          value={state.type}
          onChange={handleChange}
          defaultValue=""
          defaultCheckDisabled
          options={[
            { value: "WO", label: "Work Order" },
            { value: "TB", label: "Tender's Board" },
            { value: "FEC", label: "FEC" },
          ]}
        />
      </div>
    </>
  );
};

export default Threshold;
