import { CarderResponseData } from "app/Repositories/Carder/data";
import { FormPageComponentProps } from "bootstrap";
import React from "react";
import TextInput from "../components/forms/TextInput";

const Carder: React.FC<FormPageComponentProps<CarderResponseData>> = ({
  state,
  handleChange,
}) => {
  return (
    <>
      <div className="col-md-12">
        <TextInput
          label="Name"
          name="name"
          value={state.name}
          onChange={handleChange}
          placeholder="Enter Name"
        />
      </div>
    </>
  );
};

export default Carder;
