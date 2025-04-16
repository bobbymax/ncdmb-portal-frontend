import { EntityResponseData } from "app/Repositories/Entity/data";
import { FormPageComponentProps } from "bootstrap";
import React, { useEffect } from "react";
import TextInput from "../components/forms/TextInput";

const Entity: React.FC<FormPageComponentProps<EntityResponseData>> = ({
  state,
  handleChange,
}) => {
  return (
    <>
      <div className="col-md-4 mb-3">
        <TextInput
          label="Name"
          value={state.name}
          name="name"
          onChange={handleChange}
          placeholder="Enter Entity Name"
        />
      </div>
      <div className="col-md-4 mb-3">
        <TextInput
          label="Acronym"
          value={state.acronym}
          name="acronym"
          onChange={handleChange}
          placeholder="Enter Acronym"
        />
      </div>
      <div className="col-md-4 mb-3">
        <TextInput
          label="Payment Code"
          value={state.payment_code}
          name="payment_code"
          onChange={handleChange}
          placeholder="Enter Payment Code"
        />
      </div>
    </>
  );
};

export default Entity;
