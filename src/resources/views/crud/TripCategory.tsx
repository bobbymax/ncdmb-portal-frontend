/* eslint-disable react-hooks/exhaustive-deps */
import { TripCategoryResponseData } from "app/Repositories/TripCategory/data";
import { FormPageComponentProps } from "bootstrap";
import React, { useEffect, useState } from "react";
import MultiSelect, { DataOptionsProps } from "../components/forms/MultiSelect";
import { formatOptions } from "app/Support/Helpers";
import TextInput from "../components/forms/TextInput";
import Select from "../components/forms/Select";
import { ActionMeta } from "react-select";

interface DependencyProps {
  allowances: DataOptionsProps[];
}

const TripCategory: React.FC<
  FormPageComponentProps<TripCategoryResponseData>
> = ({
  state,
  setState,
  handleChange,
  dependencies,
  handleReactSelect,
  loading,
  mode,
}) => {
  const [allowances, setAllowances] = useState<DataOptionsProps[]>([]);
  const [selectedAllowances, setSelectedAllowances] = useState<
    DataOptionsProps[]
  >([]);

  const handleAllowancesChange = (
    newValue: unknown,
    actionMeta: ActionMeta<unknown>
  ) => {
    handleReactSelect(newValue, actionMeta, (value) => {
      setSelectedAllowances(value as DataOptionsProps[]);
    });
  };

  useEffect(() => {
    if (dependencies) {
      const { allowances = [] } = dependencies as DependencyProps;
      setAllowances(formatOptions(allowances, "id", "name"));
    }
  }, [dependencies]);

  useEffect(() => {
    if (selectedAllowances.length > 0 && setState) {
      setState({
        ...state,
        selectedAllowances,
      });
    }
  }, [selectedAllowances, setState]);

  useEffect(() => {
    if (
      mode === "update" &&
      Array.isArray(state.selectedAllowances) &&
      state.selectedAllowances.length > 0
    ) {
      setSelectedAllowances(state.selectedAllowances);
    }
  }, [mode, state.selectedAllowances]);

  return (
    <>
      <div className="col-md-4 mb-3">
        <TextInput
          label="Name"
          name="name"
          value={state.name}
          onChange={handleChange}
          placeholder="Enter Category Name"
        />
      </div>
      <div className={`col-md-8 mb-3`}>
        <MultiSelect
          label="Allowance Components"
          options={allowances}
          value={selectedAllowances}
          onChange={handleAllowancesChange}
          placeholder="Components"
          isSearchable
          isDisabled={loading}
          isMulti
        />
      </div>
      <div className="col-md-6 mb-3">
        <Select
          label="Trip Type"
          name="type"
          value={state.type}
          onChange={handleChange}
          defaultValue=""
          valueKey="value"
          labelKey="label"
          defaultCheckDisabled
          options={[
            { label: "Flight", value: "flight" },
            { label: "Road", value: "road" },
          ]}
        />
      </div>
      <div className="col-md-6 mb-3">
        <Select
          label="Accomodation Type"
          name="accommodation_type"
          value={state.accommodation_type}
          onChange={handleChange}
          defaultValue=""
          valueKey="value"
          labelKey="label"
          defaultCheckDisabled
          options={[
            { label: "Self Sponsored", value: "non-residence" },
            { label: "Board Sponsored", value: "residence" },
          ]}
        />
      </div>
    </>
  );
};

export default TripCategory;
