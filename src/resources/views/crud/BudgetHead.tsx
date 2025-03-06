import { BudgetHeadResponseData } from "app/Repositories/BudgetHead/data";
import { FormPageComponentProps } from "bootstrap";
import React, { useEffect, useState } from "react";
import TextInput from "../components/forms/TextInput";
import Select from "../components/forms/Select";

const BudgetHead: React.FC<FormPageComponentProps<BudgetHeadResponseData>> = ({
  state,
  handleChange,
  dependencies,
}) => {
  return (
    <>
      <div className="col-md-3 mb-3">
        <TextInput
          label="Code"
          value={state.code}
          name="code"
          onChange={handleChange}
          placeholder="Enter Budget Code"
        />
      </div>
      <div className="col-md-5 mb-3">
        <TextInput
          label="Name"
          value={state.name}
          name="name"
          onChange={handleChange}
          placeholder="Enter Budget Head Name"
        />
      </div>
      <div className="col-md-4 mb-3">
        <Select
          label="Block Budget Head"
          value={state.is_blocked}
          onChange={handleChange}
          name="is_blocked"
          labelKey="label"
          valueKey="value"
          defaultValue={999}
          defaultCheckDisabled
          size="sm"
          defaultText="Make Decision"
          options={[
            { label: "Yes", value: 1 },
            { label: "No", value: 0 },
          ]}
        />
      </div>
    </>
  );
};

export default BudgetHead;
