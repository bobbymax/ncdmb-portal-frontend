import React from "react";
import { WithIcon } from "./TextInputWithIcon";

const LoginTextInputWithIcon: React.FC<WithIcon> = ({
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
    <div className="login-from-group-inputs">
      <div className="with-icon">
        <i className={`ri-${icon}-fill special-icon`} />
        <input
          type={type}
          id={name}
          value={value}
          onChange={onChange}
          className={`login-form-control login-form-${size} login-control-with-icon`}
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

export default LoginTextInputWithIcon;
