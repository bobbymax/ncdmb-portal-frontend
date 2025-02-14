import { LocationResponseData } from "app/Repositories/Location/data";
import { FormPageComponentProps } from "bootstrap";
import React, { useEffect, useState } from "react";
import MultiSelect, { DataOptionsProps } from "../components/forms/MultiSelect";
import { CityResponseData } from "app/Repositories/City/data";
import { formatOptions } from "app/Support/Helpers";
import TextInput from "../components/forms/TextInput";
import Textarea from "../components/forms/Textarea";
import Select from "../components/forms/Select";

interface DependencyProps {
  cities: CityResponseData[];
}

const Location: React.FC<FormPageComponentProps<LocationResponseData>> = ({
  state,
  setState,
  loading,
  handleChange,
  dependencies,
  mode,
}) => {
  const [cities, setCities] = useState<DataOptionsProps[]>([]);
  const [city, setCity] = useState<DataOptionsProps | null>(null);

  const handleSelectedChange = (newValue: unknown) => {
    const updatedValue = newValue as DataOptionsProps;

    setCity(updatedValue);

    if (setState) {
      setState((prev) => ({ ...prev, city_id: updatedValue.value }));
    }
  };

  useEffect(() => {
    if (dependencies) {
      const { cities = [] } = dependencies as DependencyProps;
      setCities(formatOptions(cities, "id", "name"));
    }
  }, [dependencies]);

  useEffect(() => {
    if (mode === "update" && state.city_id > 0 && cities.length > 0) {
      const city = cities.find((city) => city.value === state.city_id) ?? null;

      setCity(city);
    }
  }, [mode, state.city_id, cities]);

  return (
    <>
      <div className="col-md-4 mb-3">
        <MultiSelect
          label="State"
          options={cities}
          value={city}
          onChange={handleSelectedChange}
          placeholder="State"
          isSearchable
          isDisabled={loading}
        />
      </div>
      <div className="col-md-5 mb-3">
        <TextInput
          label="Name"
          name="name"
          value={state.name}
          placeholder="Enter Location Name"
          onChange={handleChange}
          isDisabled={loading}
        />
      </div>
      <div className="col-md-3 mb-3">
        <Select
          label="Decommissioned"
          valueKey="value"
          labelKey="label"
          value={state.is_closed}
          onChange={handleChange}
          options={[
            { value: 1, label: "Yes" },
            { value: 0, label: "No" },
          ]}
          defaultCheckDisabled
          isDisabled={loading}
          defaultValue={999}
          size="sm"
        />
      </div>
      <div className="col-md-12 mb-3">
        <Textarea
          label="Address"
          name="address"
          value={state.address}
          onChange={handleChange}
          placeholder="Enter Building Address"
          rows={4}
          isDisabled={loading}
        />
      </div>
    </>
  );
};

export default Location;
