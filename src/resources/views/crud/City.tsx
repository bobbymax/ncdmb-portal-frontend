import { AllowanceResponseData } from "app/Repositories/Allowance/data";
import { CityResponseData } from "app/Repositories/City/data";
import { FormPageComponentProps } from "bootstrap";
import React, { useEffect, useState } from "react";
import { DataOptionsProps } from "../components/forms/MultiSelect";
import { formatOptions } from "app/Support/Helpers";
import Select from "../components/forms/Select";
import TextInput from "../components/forms/TextInput";

interface DependencyProps {
  allowances: AllowanceResponseData[];
}

const City: React.FC<FormPageComponentProps<CityResponseData>> = ({
  state,
  handleChange,
  dependencies,
}) => {
  const [allowances, setAllowances] = useState<DataOptionsProps[]>([]);

  useEffect(() => {
    if (dependencies) {
      const { allowances = [] } = dependencies as DependencyProps;

      const filteredAllowances = allowances.filter(
        (allowance) =>
          allowance.days_required === 1 &&
          allowance.is_active === 1 &&
          allowance.category === "item"
      );

      setAllowances(formatOptions(filteredAllowances, "id", "name"));
    }
  }, [dependencies]);

  console.log(allowances);

  return (
    <>
      <div className="col-md-4">
        <Select
          label="Allowance"
          value={state.allowance_id}
          name="allowance_id"
          onChange={handleChange}
          options={allowances}
          valueKey="value"
          labelKey="label"
          defaultValue={0}
          defaultCheckDisabled
        />
      </div>
      <div className="col-md-8 mb-3">
        <TextInput
          label="Name"
          value={state.name}
          name="name"
          onChange={handleChange}
          placeholder="Enter City Name"
        />
      </div>
      <div className="col-md-6 mb-3">
        <Select
          label="Is Capital City?"
          value={state.is_capital}
          name="is_capital"
          onChange={handleChange}
          options={[
            { label: "Yes", value: 1 },
            { label: "No", value: 0 },
          ]}
          valueKey="value"
          labelKey="label"
          defaultValue={999}
          defaultCheckDisabled
        />
      </div>
      <div className="col-md-6 mb-3">
        <Select
          label="Has Airport?"
          value={state.has_airport}
          name="has_airport"
          onChange={handleChange}
          options={[
            { label: "Yes", value: 1 },
            { label: "No", value: 0 },
          ]}
          valueKey="value"
          labelKey="label"
          defaultValue={999}
          defaultCheckDisabled
        />
      </div>
    </>
  );
};

export default City;
