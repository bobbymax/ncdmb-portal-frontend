import React, { ChangeEvent } from "react";

export interface SelectInputProps {
  label?: string;
  value?: number | string | undefined;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  defaultValue: string | number;
  defaultText?: string;
  defaultCheckDisabled?: boolean;
  name?: string;
  isDisabled?: boolean;
  valueKey: string;
  labelKey: string;
  options: any[];
  width?: number;
  onBlur?: () => void;
}

const Select: React.FC<SelectInputProps> = ({
  label,
  value,
  size = "lg",
  onChange,
  defaultValue,
  defaultText,
  name,
  isDisabled = false,
  valueKey,
  labelKey,
  options = [],
  defaultCheckDisabled = false,
  width = 100,
  onBlur,
  ...attributes
}) => {
  return (
    <div className="storm-form-group flex column mb-3">
      {label && (
        <label className="storm-form-label mb-2" htmlFor={name}>
          {label}:
        </label>
      )}

      <div className="select-wrapper">
        <select
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className={`storm-form-control storm-form-${size} storm-select-control`}
          id={name}
          disabled={isDisabled}
          style={{ width: `${width}%` }}
          {...attributes}
        >
          <option value={defaultValue} disabled={defaultCheckDisabled}>
            {defaultText ?? `Select ${label}`}
          </option>
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
        <div className="select-arrow">
          <i className="ri-arrow-down-s-line" />
        </div>
      </div>
    </div>
  );
};

export default Select;
