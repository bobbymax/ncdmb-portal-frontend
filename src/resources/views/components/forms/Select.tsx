import React, { ChangeEvent } from "react";

export interface SelectInputProps {
  label: string;
  value?: number | string | undefined;
  size?: "sm" | "md" | "lg" | "xl";
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  defaultValue: string | number;
  name?: string;
  isDisabled?: boolean;
  valueKey: string;
  labelKey: string;
  options: any[];
}

const Select: React.FC<SelectInputProps> = ({
  label,
  value,
  size = "lg",
  onChange,
  defaultValue,
  name,
  isDisabled,
  valueKey,
  labelKey,
  options = [],
  ...attributes
}) => {
  return (
    <div className="storm-form-group flex column mb-3">
      {label && (
        <label className="storm-form-label mb-2" htmlFor={name}>
          {label}:
        </label>
      )}

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="form-select form-select-lg"
        id={name}
      >
        <option value={defaultValue}>Select {label}</option>
        {options.map((opt, i) => (
          <option
            key={i}
            value={
              typeof defaultValue === "number"
                ? Number(opt[valueKey])
                : opt[valueKey]
            }
          >
            {opt[labelKey]}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
