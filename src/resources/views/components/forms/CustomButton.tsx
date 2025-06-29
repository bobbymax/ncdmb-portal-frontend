import React from "react";

export interface ButtonProps {
  label?: string | number;
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
}

const CustomButton: React.FC<ButtonProps> = ({
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
}) => {
  return (
    <div className="custom-group flex align gap-md">
      <button
        type={type}
        className={`custom-bttn custom-bttn-${size} custom-bttn-${variant} ${additionalClass} ${
          fullWidth ? " custom-bttn-full " : ""
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

export default CustomButton;
