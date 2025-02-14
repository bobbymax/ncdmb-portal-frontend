import React, { ChangeEvent } from "react";

export interface CheckboxProps {
  label: string;
  type?: "radio" | "checkbox";
  value?: number | string | undefined;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  isDisabled?: boolean;
  isChecked: boolean;
}

const Box: React.FC<CheckboxProps> = ({
  label,
  type = "checkbox",
  value,
  onChange,
  name,
  isDisabled,
  isChecked,
}) => {
  return (
    <>
      <div className="form-check form-switch">
        <input
          className="form-check-input"
          type={type}
          role="switch"
          id={name}
          checked={isChecked}
          value={value}
          onChange={onChange}
          name={name}
          disabled={isDisabled}
        />
        <label className="form-check-label">{label}</label>
      </div>
    </>
  );
};

export default Box;
