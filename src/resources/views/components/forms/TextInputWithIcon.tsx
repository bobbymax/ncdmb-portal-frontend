import React from "react";
import { TextInputProps } from "./TextInput";

interface WithIcon extends TextInputProps {
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
  width = 30,
  ...attributes
}) => {
  return (
    <div className="storm-form-group">
      {label && (
        <label className="storm-form-label" htmlFor={name}>
          {label}:
        </label>
      )}
      <div className="with-icon">
        <i className={`${icon} icon-item`} />
        <input
          type={type}
          id={name}
          value={value}
          onChange={onChange}
          className={`storm-form-control storm-form-${size} storm-control-with-icon`}
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
      </div>
    </div>
  );
};

export default TextInputWithIcon;
