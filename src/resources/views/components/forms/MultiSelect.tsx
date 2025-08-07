import React from "react";
import Select, { ActionMeta } from "react-select";
import makeAnimated from "react-select/animated";

export interface DataOptionsProps {
  value: any;
  label: string;
}

interface MultiSelectProps {
  label?: string;
  value: any;
  options: DataOptionsProps[];
  placeholder: string;
  onChange: (newValue: unknown, actionMeta: ActionMeta<unknown>) => void;
  isSearchable?: boolean;
  isMulti?: boolean;
  isDisabled?: boolean;
  description?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  width?: number;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  value,
  options,
  placeholder,
  onChange,
  isSearchable = true,
  isMulti = false,
  isDisabled = false,
  description,
  size = "lg",
  width = 100,
}) => {
  const animated = makeAnimated();

  // Custom styles to match your form elements
  const customStyles = {
    control: (base: any, state: any) => ({
      ...base,
      minHeight:
        size === "xs"
          ? "32px"
          : size === "sm"
          ? "36px"
          : size === "md"
          ? "40px"
          : size === "lg"
          ? "44px"
          : "48px",
      backgroundColor: "rgba(255, 255, 255, 0.8)",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(226, 232, 240, 0.8)",
      borderRadius: "8px",
      boxShadow: state.isFocused ? "0 0 0 3px rgba(40, 199, 111, 0.1)" : "none",
      borderColor: state.isFocused
        ? "#28c76f"
        : state.isDisabled
        ? "rgba(226, 232, 240, 0.6)"
        : "rgba(226, 232, 240, 0.8)",
      "&:hover": {
        borderColor: state.isDisabled
          ? "rgba(226, 232, 240, 0.6)"
          : "rgba(40, 199, 111, 0.5)",
        backgroundColor: "rgba(255, 255, 255, 0.9)",
      },
      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
      width: `${width}%`,
      cursor: state.isDisabled ? "not-allowed" : "pointer",
      opacity: state.isDisabled ? 0.6 : 1,
    }),
    menu: (base: any) => ({
      ...base,
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(226, 232, 240, 0.8)",
      borderRadius: "8px",
      boxShadow:
        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      marginTop: "4px",
      zIndex: 99999,
      position: "fixed",
      width: "auto",
      minWidth: "100%",
    }),
    menuList: (base: any) => ({
      ...base,
      maxHeight: "200px",
      overflow: "auto",
    }),
    menuPortal: (base: any) => ({
      ...base,
      zIndex: 99999,
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "rgba(40, 199, 111, 0.15)"
        : state.isFocused
        ? "rgba(40, 199, 111, 0.1)"
        : "transparent",
      color: state.isSelected ? "#28c76f" : "#1e293b",
      fontWeight: state.isSelected ? 500 : 400,
      padding:
        size === "xs"
          ? "6px 12px"
          : size === "sm"
          ? "8px 14px"
          : size === "md"
          ? "10px 16px"
          : size === "lg"
          ? "12px 18px"
          : "14px 20px",
      fontSize:
        size === "xs"
          ? "0.75rem"
          : size === "sm"
          ? "0.8125rem"
          : size === "md"
          ? "0.875rem"
          : size === "lg"
          ? "0.875rem"
          : "1rem",
      cursor: "pointer",
      "&:hover": {
        backgroundColor: "rgba(40, 199, 111, 0.1)",
      },
    }),
    multiValue: (base: any) => ({
      ...base,
      backgroundColor: "rgba(40, 199, 111, 0.1)",
      border: "1px solid rgba(40, 199, 111, 0.2)",
      borderRadius: "6px",
      padding: "2px 6px",
      margin: "2px",
    }),
    multiValueLabel: (base: any) => ({
      ...base,
      color: "#28c76f",
      fontWeight: 500,
      fontSize:
        size === "xs" ? "0.75rem" : size === "sm" ? "0.8125rem" : "0.875rem",
    }),
    multiValueRemove: (base: any) => ({
      ...base,
      color: "#28c76f",
      "&:hover": {
        backgroundColor: "rgba(40, 199, 111, 0.2)",
        color: "#28c76f",
      },
    }),
    placeholder: (base: any) => ({
      ...base,
      color: "#94a3b8",
      fontSize:
        size === "xs"
          ? "0.75rem"
          : size === "sm"
          ? "0.8125rem"
          : size === "md"
          ? "0.875rem"
          : size === "lg"
          ? "0.875rem"
          : "1rem",
    }),
    singleValue: (base: any) => ({
      ...base,
      color: "#1e293b",
      fontSize:
        size === "xs"
          ? "0.75rem"
          : size === "sm"
          ? "0.8125rem"
          : size === "md"
          ? "0.875rem"
          : size === "lg"
          ? "0.875rem"
          : "1rem",
    }),
    input: (base: any) => ({
      ...base,
      color: "#1e293b",
      fontSize:
        size === "xs"
          ? "0.75rem"
          : size === "sm"
          ? "0.8125rem"
          : size === "md"
          ? "0.875rem"
          : size === "lg"
          ? "0.875rem"
          : "1rem",
    }),
    indicatorsContainer: (base: any) => ({
      ...base,
      paddingRight:
        size === "xs"
          ? "8px"
          : size === "sm"
          ? "10px"
          : size === "md"
          ? "12px"
          : size === "lg"
          ? "14px"
          : "16px",
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
    dropdownIndicator: (base: any, state: any) => ({
      ...base,
      color: state.isFocused ? "#28c76f" : "#64748b",
      transition: "color 0.2s ease",
      "&:hover": {
        color: "#28c76f",
      },
    }),
    clearIndicator: (base: any) => ({
      ...base,
      color: "#64748b",
      "&:hover": {
        color: "#28c76f",
      },
    }),
  };

  // Dark mode styles
  const darkModeStyles = {
    control: (base: any, state: any) => ({
      ...base,
      backgroundColor: "rgba(15, 23, 42, 0.8)",
      borderColor: state.isFocused
        ? "#28c76f"
        : state.isDisabled
        ? "rgba(51, 65, 85, 0.6)"
        : "rgba(51, 65, 85, 0.8)",
      "&:hover": {
        borderColor: state.isDisabled
          ? "rgba(51, 65, 85, 0.6)"
          : "rgba(40, 199, 111, 0.5)",
        backgroundColor: "rgba(15, 23, 42, 0.9)",
      },
    }),
    menu: (base: any) => ({
      ...base,
      backgroundColor: "rgba(15, 23, 42, 0.95)",
      border: "1px solid rgba(51, 65, 85, 0.8)",
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "rgba(40, 199, 111, 0.2)"
        : state.isFocused
        ? "rgba(40, 199, 111, 0.15)"
        : "transparent",
      color: state.isSelected ? "#28c76f" : "#e2e8f0",
    }),
    placeholder: (base: any) => ({
      ...base,
      color: "#64748b",
    }),
    singleValue: (base: any) => ({
      ...base,
      color: "#e2e8f0",
    }),
    input: (base: any) => ({
      ...base,
      color: "#e2e8f0",
    }),
    dropdownIndicator: (base: any, state: any) => ({
      ...base,
      color: state.isFocused ? "#28c76f" : "#94a3b8",
    }),
    clearIndicator: (base: any) => ({
      ...base,
      color: "#94a3b8",
    }),
  };

  // Check if dark mode is active
  const isDarkMode =
    document.documentElement.getAttribute("data-theme") === "dark";
  const finalStyles = isDarkMode
    ? { ...customStyles, ...darkModeStyles }
    : customStyles;

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
        classNamePrefix="storm-multiselect"
        styles={finalStyles}
        menuPortalTarget={document.body}
        menuPosition="fixed"
        theme={(theme) => ({
          ...theme,
          colors: {
            ...theme.colors,
            primary: "#28c76f",
            primary25: "rgba(40, 199, 111, 0.1)",
            primary50: "rgba(40, 199, 111, 0.15)",
            primary75: "rgba(40, 199, 111, 0.2)",
          },
        })}
      />
    </div>
  );
};

export default MultiSelect;
