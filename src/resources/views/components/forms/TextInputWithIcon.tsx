import React from "react";
import { TextInputProps } from "./TextInput";

export interface WithIcon extends TextInputProps {
  icon: string;
  width?: number;
}

const TextInputWithIcon: React.FC<WithIcon> = ({
  label,
  type = "text",
  value,
  size = "lg",
  onChange,
  placeholder,
  name,
  isDisabled = false,
  min,
  max,
  icon,
  width = 100,
  ...attributes
}) => {
  return (
    <div className="storm-form-group">
      {label && (
        <label className="storm-form-label" htmlFor={name}>
          {label}:
        </label>
      )}
      <div className="search-input-container">
        <div className="search-input-wrapper">
          <input
            type={type}
            id={name}
            value={value}
            onChange={onChange}
            className={`search-input search-input-${size}`}
            placeholder={placeholder}
            disabled={isDisabled}
            name={name}
            min={min}
            max={max}
            style={{
              width: `${width}%`,
            }}
            {...attributes}
          />
          <div className="search-icon">
            <i className={`ri-${icon}-line`} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextInputWithIcon;
