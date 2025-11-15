import { MeasurementTypeResponseData } from "app/Repositories/MeasurementType/data";
import { FormPageComponentProps } from "bootstrap";
import React, { useEffect, useState } from "react";
import TextInput from "../components/forms/TextInput";

const MeasurementType: React.FC<
  FormPageComponentProps<MeasurementTypeResponseData>
> = ({ state, handleChange }) => {
  return (
    <>
      <div className="col-md-12">
        <TextInput
          label="Name"
          name="name"
          value={state.name}
          onChange={handleChange}
          placeholder="Enter Measurement Type Name"
        />
      </div>
    </>
  );
};

export default MeasurementType;
