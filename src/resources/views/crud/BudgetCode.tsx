import { BudgetCodeResponseData } from "app/Repositories/BudgetCode/data";
import { FormPageComponentProps } from "bootstrap";
import React, { useEffect, useState } from "react";
import TextInput from "../components/forms/TextInput";

const BudgetCode: React.FC<FormPageComponentProps<BudgetCodeResponseData>> = ({
  state,
  handleChange,
  dependencies,
}) => {
  return (
    <>
      <div className="col-md-12 mb-3">
        <TextInput
          label="Code"
          value={state.code}
          onChange={handleChange}
          placeholder="Enter Budget Code"
          name="code"
        />
      </div>
    </>
  );
};

export default BudgetCode;
