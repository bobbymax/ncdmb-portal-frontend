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
}) => {
  const animated = makeAnimated();

  return (
    <div className="storm-form-group flex column mb-3">
      {label && <label className="storm-form-label mb-2">{label}:</label>}

      <Select
        components={animated}
        options={options}
        placeholder={`Select ${placeholder}`}
        value={value}
        onChange={onChange}
        isSearchable={isSearchable}
        isMulti={isMulti}
        isDisabled={isDisabled}
      />
    </div>
  );
};

export default MultiSelect;
