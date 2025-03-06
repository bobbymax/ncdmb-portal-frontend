import { AllowanceResponseData } from "app/Repositories/Allowance/data";
import { GradeLevelResponseData } from "app/Repositories/GradeLevel/data";
import { RemunerationResponseData } from "app/Repositories/Remuneration/data";
import { FormPageComponentProps } from "bootstrap";
import React, { useCallback, useEffect, useState } from "react";
import MultiSelect, { DataOptionsProps } from "../components/forms/MultiSelect";
import { formatNumber, options } from "app/Support/Helpers";
import { ActionMeta } from "react-select";
import TextInput from "../components/forms/TextInput";
import Select from "../components/forms/Select";

interface DependencyProps {
  allowances: AllowanceResponseData[];
  gradeLevels: GradeLevelResponseData[];
}

const Remuneration: React.FC<
  FormPageComponentProps<RemunerationResponseData>
> = ({ state, setState, handleChange, dependencies, mode, loading }) => {
  const [allowances, setAllowances] = useState<DataOptionsProps[]>([]);
  const [gradeLevels, setGradeLevels] = useState<DataOptionsProps[]>([]);
  const [displayValue, setDisplayValue] = useState<string>("");

  const [selectedOptions, setSelectedOptions] = useState<{
    allowance: DataOptionsProps | null;
    grade_level: DataOptionsProps | null;
  }>({
    allowance: null,
    grade_level: null,
  });

  const handleSelectionChange = useCallback(
    (key: "allowance" | "grade_level") =>
      (newValue: unknown, actionMeta: ActionMeta<unknown>) => {
        const updatedValue = newValue as DataOptionsProps;
        setSelectedOptions((prev) => ({ ...prev, [key]: updatedValue }));

        if (setState) {
          setState((prev) => ({ ...prev, [`${key}_id`]: updatedValue.value }));
        }
      },
    [setState]
  );

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    const value = e.target.value.replace(/,/g, "");

    if (/^\d*\.?\d*$/.test(value)) {
      if (setState) {
        setState((prev) => ({
          ...prev,
          amount: Number(value),
        }));
      }
      setDisplayValue(formatNumber(value));
    }
  };

  useEffect(() => {
    if (dependencies) {
      const { allowances = [], gradeLevels = [] } =
        dependencies as DependencyProps;
      setAllowances(options(allowances, "name"));
      setGradeLevels(options(gradeLevels, "key"));
    }
  }, [dependencies]);

  useEffect(() => {
    if (
      mode === "update" &&
      state.allowance_id > 0 &&
      state.grade_level_id > 0 &&
      allowances.length > 0
    ) {
      if (/^\d*\.?\d*$/.test(state.amount.toString())) {
        setDisplayValue(formatNumber(state.amount.toString()));
      }
      const allowance = allowances.find(
        (allo) => allo.value === state.allowance_id
      );

      const grade = gradeLevels.find(
        (grad) => grad.value === state.grade_level_id
      );

      setSelectedOptions({
        allowance: allowance ?? null,
        grade_level: grade ?? null,
      });
    }
  }, [mode, state.allowance_id, state.grade_level_id, allowances, gradeLevels]);

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
      {renderMultiSelect(
        "Allowances",
        allowances,
        selectedOptions.allowance,
        handleSelectionChange("allowance"),
        "Allowance"
      )}
      {renderMultiSelect(
        "Grade Levels",
        gradeLevels,
        selectedOptions.grade_level,
        handleSelectionChange("grade_level"),
        "Grade Level"
      )}
      <div className="col-md-4 mb-3">
        <TextInput
          label="Amount"
          name="amount"
          value={displayValue}
          onChange={handleCurrencyChange}
          placeholder="Amount"
        />
      </div>
      <div className="col-md-4 mb-3">
        <Select
          label="Currency"
          name="currency"
          valueKey="value"
          labelKey="label"
          defaultValue=""
          defaultCheckDisabled
          value={state.currency}
          onChange={handleChange}
          options={[
            { value: "NGN", label: "NGN" },
            { value: "USD", label: "USD" },
            { value: "GBP", label: "GBP" },
            { value: "EUR", label: "EUR" },
          ]}
          size="sm"
        />
      </div>
      <div className="col-md-4 mb-3">
        <Select
          label="Active State"
          name="is_active"
          valueKey="value"
          labelKey="label"
          defaultValue={0}
          defaultCheckDisabled
          value={state.is_active}
          onChange={handleChange}
          options={[
            { value: 0, label: "Not Active" },
            { value: 1, label: "Active" },
          ]}
          size="sm"
        />
      </div>
      <div className="col-md-6 mb-3">
        <TextInput
          label="Start Date"
          value={state.start_date}
          name="start_date"
          onChange={handleChange}
          type="date"
        />
      </div>
      <div className="col-md-6 mb-3">
        <TextInput
          label="Expiration Date"
          value={state.expiration_date}
          name="expiration_date"
          onChange={handleChange}
          type="date"
        />
      </div>
    </>
  );
};

export default Remuneration;
