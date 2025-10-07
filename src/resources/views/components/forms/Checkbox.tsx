import React, { ChangeEvent } from "react";

export interface CheckboxProps {
  label: string;
  name: string;
  checked: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  isDisabled?: boolean;
  helpText?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
  label,
  name,
  checked,
  onChange,
  isDisabled = false,
  helpText,
}) => {
  return (
    <div className="storm-form-group mb-2">
      <div className="custom__checkbox">
        <input
          type="checkbox"
          id={name}
          name={name}
          checked={checked}
          onChange={onChange}
          disabled={isDisabled}
          className="checkbox__input"
        />
        <label htmlFor={name} className="checkbox__label">
          <div className="checkbox__checkmark">
            <i className="ri-check-line"></i>
          </div>
          <span className="checkbox__text">{label}</span>
        </label>
      </div>
      {helpText && (
        <small
          className="form-text text-muted"
          style={{ marginLeft: "2rem", fontSize: "0.75rem" }}
        >
          {helpText}
        </small>
      )}
    </div>
  );
};

export default Checkbox;
