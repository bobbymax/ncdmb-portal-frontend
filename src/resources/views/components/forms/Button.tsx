import React from "react";

export interface ButtonProps {
  label?: string | number;
  style?: React.CSSProperties;
  variant?: "primary" | "success" | "info" | "warning" | "danger" | "dark";
  type?: "submit" | "button";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  icon?: string;
  fontSize?: number;
  isDisabled?: boolean;
  place?: "left" | "right";
  additionalClass?: string;
  fullWidth?: boolean;
  rounded?: boolean;
  handleClick?: (value: string | number | object | []) => void;
  iconSize?: "lg" | "nm";
  bgColor?: string;
}

const Button: React.FC<ButtonProps> = ({
  label,
  variant = "info",
  type = "button",
  size = "md",
  icon = "",
  fontSize = 13,
  place = "left",
  isDisabled = false,
  additionalClass = "",
  fullWidth = false,
  rounded = false,
  handleClick = undefined,
  iconSize = "nm",
  bgColor,
  style,
}) => {
  return (
    <div className="bttn-group flex align gap-md">
      <button
        style={style}
        type={type}
        className={`storm-bttn storm-bttn-${size} storm-bttn-${variant} ${additionalClass} ${
          fullWidth ? " storm-bttn-full " : ""
        } ${rounded ? " rounded " : ""} ${isDisabled ? " is-disabled " : ""}`}
        onClick={handleClick}
        disabled={isDisabled}
      >
        {place === "left" && icon && (
          <i
            className={`${icon} ${
              iconSize && iconSize === "lg" ? "bttn__icon" : ""
            }`}
          />
        )}
        {label && <span>{label}</span>}
        {place === "right" && icon && <i className={icon} />}
      </button>
    </div>
  );
};

export default Button;
