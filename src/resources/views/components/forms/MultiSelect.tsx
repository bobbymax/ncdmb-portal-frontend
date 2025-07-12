import React from "react";
import Select, { ActionMeta } from "react-select";
import makeAnimated from "react-select/animated";

export interface DataOptionsProps {
  value: any;
  label: string;
}

interface MultiSelectProps {
  label: string;
  value: any;
  options: DataOptionsProps[];
  placeholder: string;
  onChange: (newValue: unknown, actionMeta: ActionMeta<unknown>) => void;
  isSearchable: boolean;
  isMulti?: boolean;
  isDisabled: boolean;
  description?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  value,
  options,
  placeholder,
  onChange,
  isSearchable,
  isMulti,
  isDisabled,
  description,
}) => {
  const animated = makeAnimated();

  return (
    <div className="storm-form-group flex column mb-3">
      {label && <label className="storm-form-label mb-2">{label}:</label>}
      {description && (
        <small className="label__description">{description}</small>
      )}

      <Select
        components={animated}
        options={options}
        placeholder={`Select ${placeholder}`}
        value={value}
        onChange={onChange}
        isSearchable={isSearchable}
        isMulti={isMulti}
        isDisabled={isDisabled}
        classNamePrefix="react-select"
        theme={(theme) => ({
          ...theme,
          colors: {
            ...theme.colors,
            primary: "#3fa34d",
            primary25: "#f5f9e9",
          },
        })}
        styles={{
          control: (baseStyles, state) => ({
            ...baseStyles,
            width: state.options ? "100%" : "0%",
          }),
        }}
      />
    </div>
  );
};

export default MultiSelect;
