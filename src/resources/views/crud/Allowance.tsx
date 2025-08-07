/* eslint-disable react-hooks/exhaustive-deps */
import { AllowanceResponseData } from "app/Repositories/Allowance/data";
import { GradeLevelResponseData } from "app/Repositories/GradeLevel/data";
import { FormPageComponentProps } from "bootstrap";
import React, { useCallback, useEffect, useState } from "react";
import MultiSelect, { DataOptionsProps } from "../components/forms/MultiSelect";
import { formatCurrency, formatOptions } from "app/Support/Helpers";
import TextInput from "../components/forms/TextInput";
import Select from "../components/forms/Select";
import Textarea from "../components/forms/Textarea";
import Button from "../components/forms/Button";
import { useModal } from "app/Context/ModalContext";
import RemunerationModal from "./modals/RemunerationModal";
import RemunerationRepository from "app/Repositories/Remuneration/RemunerationRepository";
import { Raw } from "app/Support/DataTable";
import { CityResponseData } from "app/Repositories/City/data";
import { ActionMeta } from "react-select";
import { JsonResponse } from "app/Repositories/BaseRepository";
import { repo } from "bootstrap/repositories";

interface DependencyProps {
  allowances: AllowanceResponseData[];
  gradeLevels: GradeLevelResponseData[];
  cities: CityResponseData[];
}

export interface ResponseSubmitData {
  id: number;
  gradeLevels: DataOptionsProps[];
  amount: string;
}

const Allowance: React.FC<FormPageComponentProps<AllowanceResponseData>> = ({
  state,
  setState,
  handleChange,
  handleReactSelect,
  dependencies,
  mode,
  loading,
}) => {
  const { openModal, closeModal } = useModal();
  const [gradeLevels, setGradeLevels] = useState<DataOptionsProps[]>([]);
  const [allowances, setAllowances] = useState<DataOptionsProps[]>([]);
  const [cities, setCities] = useState<DataOptionsProps[]>([]);
  const [rems, setRems] = useState<ResponseSubmitData[]>([]);

  const [selectedOptions, setSelectedOptions] = useState<{
    departure_city: DataOptionsProps | null;
    destination_city: DataOptionsProps | null;
  }>({
    departure_city: null,
    destination_city: null,
  });

  const handleSelectionChange = useCallback(
    (key: "departure_city" | "destination_city") =>
      (newValue: unknown, actionMeta: ActionMeta<unknown>) => {
        const updatedValue = newValue as DataOptionsProps;
        setSelectedOptions((prev) => ({ ...prev, [key]: updatedValue }));
      },
    []
  );

  const remunerationRepo = repo("remuneration");

  const onSubmit = (
    response: object | string,
    mode: "store" | "update" | "destroy" | "generate"
  ) => {
    const raw = response as ResponseSubmitData;
    if (mode === "update") {
      setRems(
        rems.map((rem) => {
          if (rem.id === raw.id) {
            return raw;
          }

          return rem;
        })
      );
    } else {
      setRems([raw, ...rems]);
    }

    closeModal();
  };

  // console.log(state);

  const onManageRaw = (raw: JsonResponse) => {
    openModal(
      RemunerationModal,
      "remuneration",
      {
        title: `Update Remuneration`,
        data: raw,
        isUpdating: true,
        onSubmit,
        dependencies: [gradeLevels],
        count: rems.length,
        currentId: raw.id,
      },
      remunerationRepo.getState()
    );
  };

  useEffect(() => {
    if (dependencies) {
      const {
        allowances = [],
        gradeLevels = [],
        cities = [],
      } = dependencies as DependencyProps;
      const none = { value: 0, label: "None" };
      const newAllowances = formatOptions(
        allowances.filter((allowance) => allowance.category === "parent"),
        "id",
        "name"
      );
      const newCities = formatOptions(cities, "id", "name");
      setAllowances([none, ...newAllowances]);
      setGradeLevels(formatOptions(gradeLevels, "id", "key"));
      setCities([none, ...newCities]);
    }
  }, [dependencies]);

  useEffect(() => {
    if (setState) {
      setState({
        ...state,
        selectedRemunerations: rems,
        departure_city_id: selectedOptions.departure_city?.value,
        destination_city_id: selectedOptions.destination_city?.value,
      });
    }
  }, [
    rems,
    selectedOptions.departure_city,
    selectedOptions.destination_city,
    setState,
  ]);

  useEffect(() => {
    if (
      mode === "update" &&
      state.departure_city_id > 0 &&
      state.destination_city_id > 0 &&
      cities.length > 0
    ) {
      const departure_city = cities.find(
        (city) => city.value === state.departure_city_id
      );
      const destination_city = cities.find(
        (city) => city.value === state.destination_city_id
      );

      setSelectedOptions({
        departure_city: departure_city ?? null,
        destination_city: destination_city ?? null,
      });
    }
  }, [mode, state.departure_city_id, state.destination_city_id, cities]);

  const renderMultiSelect = (
    label: string,
    options: DataOptionsProps[],
    value: DataOptionsProps | null,
    onChange: (newValue: unknown, actionMeta: ActionMeta<unknown>) => void,
    placeholder: string,
    isDisabled: boolean = false,
    grid: number = 6
  ) => (
    <div className={`col-md-${grid} mb-3`}>
      <MultiSelect
        label={label}
        options={options}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        isSearchable
        isDisabled={isDisabled}
      />
    </div>
  );

  return (
    <>
      <div className="col-md-3 mb-3">
        <TextInput
          label="Name"
          name="name"
          value={state.name}
          onChange={handleChange}
          placeholder="Enter Allowance Name"
        />
      </div>
      <div className="col-md-3 mb-3">
        <Select
          label="Payment Basis"
          name="payment_basis"
          value={state.payment_basis}
          onChange={handleChange}
          valueKey="value"
          labelKey="label"
          options={[
            { value: "weekdays", label: "Weekdays" },
            { value: "days", label: "Days" },
            { value: "nights", label: "Nights" },
            { value: "fixed", label: "Fixed" },
            { value: "km", label: "Kilometers" },
            { value: "input", label: "Input" },
            { value: "other", label: "Other" },
          ]}
          defaultValue=""
          defaultCheckDisabled
          size="xl"
        />
      </div>
      <div className="col-md-3 mb-3">
        <Select
          label="Route"
          name="payment_route"
          value={state.payment_route}
          onChange={handleChange}
          valueKey="value"
          labelKey="label"
          options={[
            { value: "one-off", label: "One Off" },
            { value: "round-trip", label: "Round Trip" },
            { value: "computable", label: "Computable" },
          ]}
          defaultValue=""
          defaultCheckDisabled
          size="xl"
        />
      </div>
      <div className="col-md-3 mb-3">
        <Select
          label="Parent"
          name="parent_id"
          value={state.parent_id}
          onChange={handleChange}
          valueKey="value"
          labelKey="label"
          options={allowances}
          defaultValue={999}
          defaultCheckDisabled
          size="xl"
        />
      </div>
      <div className="col-md-3 mb-3">
        <Select
          label="Days Required"
          name="days_required"
          value={state.days_required}
          onChange={handleChange}
          valueKey="value"
          labelKey="label"
          options={[
            { value: 0, label: "No" },
            { value: 1, label: "Yes" },
          ]}
          defaultValue={999}
          defaultCheckDisabled
          size="xl"
        />
      </div>
      <div className="col-md-3 mb-3">
        <Select
          label="Active State"
          name="is_active"
          value={state.is_active}
          onChange={handleChange}
          valueKey="value"
          labelKey="label"
          options={[
            { value: 0, label: "Not Active" },
            { value: 1, label: "Active" },
          ]}
          defaultValue={999}
          defaultCheckDisabled
          size="xl"
        />
      </div>
      <div className="col-md-3 mb-3">
        <Select
          label="Category"
          name="category"
          value={state.category}
          onChange={handleChange}
          valueKey="value"
          labelKey="label"
          options={[
            { value: "parent", label: "Parent" },
            { value: "item", label: "Item" },
          ]}
          defaultValue=""
          defaultCheckDisabled
          size="xl"
        />
      </div>
      <div className="col-md-3 mb-3">
        <Select
          label="Component"
          name="component"
          value={state.component}
          onChange={handleChange}
          valueKey="value"
          labelKey="label"
          options={[
            { value: "flight-resident", label: "Flight Resident Trip" },
            { value: "flight-non-resident", label: "Flight Non-Resident Trip" },
            { value: "road-resident", label: "Road Resident Trip" },
            { value: "road-non-resident", label: "Road Non-Resident Trip" },
            { value: "both-resident", label: "Both Resident Trip" },
            { value: "both-non-resident", label: "Both Non-Resident Trip" },
            {
              value: "road-both",
              label: "Road Trip, Both Resident/Non-Resident",
            },
            {
              value: "flight-both",
              label: "Flight Trip, Both Resident/Non-Resident",
            },
            {
              value: "both-both",
              label: "Flight/Road, Resident/Non-Resident",
            },
            { value: "not-applicable", label: "Not Applicable" },
          ]}
          defaultValue=""
          defaultCheckDisabled
          size="xl"
        />
      </div>
      {renderMultiSelect(
        "Origin",
        cities,
        selectedOptions.departure_city,
        handleSelectionChange("departure_city"),
        "State"
      )}
      {renderMultiSelect(
        "Destination",
        cities,
        selectedOptions.destination_city,
        handleSelectionChange("destination_city"),
        "State",
        selectedOptions.departure_city === null
      )}
      <div className="col-md-12 mb-4">
        <Textarea
          label="Description"
          name="description"
          value={state.description}
          onChange={handleChange}
          rows={3}
          placeholder="Enter Description Here"
        />
      </div>
      <div className="col-md-12 mb-4">
        <Button
          size="sm"
          label="Add Remuneration"
          handleClick={() =>
            openModal(
              RemunerationModal,
              "remuneration",
              {
                title: `Add Remuneration`,
                isUpdating: false,
                onSubmit,
                dependencies: [gradeLevels],
                count: rems.length,
              },
              remunerationRepo.getState()
            )
          }
          icon="ri-add-box-line"
        />
      </div>
      <div className="col-md-12 mb-3">
        <div className="remuneration__container">
          {rems.map((rem, i) => (
            <div key={i} className="remunerations">
              <h2>{formatCurrency(parseFloat(rem.amount))}</h2>
              <p>{rem.gradeLevels.map((grade) => grade.label).join(", ")}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Allowance;
