import React from "react";

interface AnimatedButtonProps {
  label: string | number;
  variant?: "success" | "info" | "warning" | "danger" | "dark";
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
  animation?: string;
  delay?: number;
  flag?: "faster" | "fast";
  speedup?: boolean;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  label,
  variant = "dark",
  type = "button",
  size = "md",
  icon,
  fontSize = 13,
  place = "left",
  isDisabled = false,
  additionalClass = "",
  fullWidth = false,
  rounded = false,
  handleClick = undefined,
  animation = "bounceInLeft",
  delay = 0,
  flag = "faster",
  speedup = false,
}) => {
  return (
    <button
      type={type}
      className={`storm-bttn storm-bttn-${size} storm-bttn-${variant} ${additionalClass} ${
        isDisabled ? " is-disabled " : ""
      }`}
      onClick={handleClick}
      disabled={isDisabled}
    >
      {place === "left" && icon && <i className={icon} />}
      {label && <span>{label}</span>}
      {place === "right" && icon && <i className={icon} />}
    </button>
  );
};

export default AnimatedButton;
