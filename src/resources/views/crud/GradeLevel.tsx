import { GradeLevelResponseData } from "app/Repositories/GradeLevel/data";
import { FormPageComponentProps } from "bootstrap";
import React, { useEffect, useState } from "react";
import TextInput from "../components/forms/TextInput";
import Select from "../components/forms/Select";
import { CarderResponseData } from "app/Repositories/Carder/data";

interface DependencyProps {
  carders: CarderResponseData[];
}

const GradeLevel: React.FC<FormPageComponentProps<GradeLevelResponseData>> = ({
  state,
  handleChange,
  loading,
  dependencies,
}) => {
  const [carders, setCarders] = useState<CarderResponseData[]>([]);

  useEffect(() => {
    if (dependencies) {
      const { carders = [] } = dependencies as DependencyProps;

      setCarders(carders);
    }
  }, [dependencies]);

  return (
    <>
      <div className="col-md-7 mb-3">
        <TextInput
          label="Name"
          name="name"
          value={state.name}
          onChange={handleChange}
          isDisabled={loading}
          placeholder="Enter Grade Level Name"
        />
      </div>
      <div className="col-md-5 mb-3">
        <TextInput
          label="Key"
          name="key"
          value={state.key}
          onChange={handleChange}
          isDisabled={loading}
          placeholder="Enter Grade Level ABV"
        />
      </div>
      <div className="col-md-4 mb-3">
        <Select
          label="Carder"
          name="carder_id"
          valueKey="id"
          labelKey="name"
          defaultValue={0}
          defaultCheckDisabled
          value={state.carder_id}
          onChange={handleChange}
          isDisabled={loading}
          options={carders}
        />
      </div>
      <div className="col-md-4 mb-3">
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
      <div className="col-md-4 mb-3">
        <TextInput
          label="Rank"
          name="rank"
          value={state.rank}
          onChange={handleChange}
          isDisabled={loading}
          placeholder="Enter Grade Level Rank"
          type="number"
          min={0}
          max={13}
        />
      </div>
    </>
  );
};

export default GradeLevel;
