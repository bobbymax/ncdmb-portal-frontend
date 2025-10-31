/**
 * Reusable Validation Errors Display Component
 */

import React from "react";

interface ValidationErrorsProps {
  errors: Record<string, string[]> | string[];
  className?: string;
}

export const ValidationErrors: React.FC<ValidationErrorsProps> = ({
  errors,
  className = "",
}) => {
  // Handle array of errors
  if (Array.isArray(errors)) {
    if (errors.length === 0) return null;

    return (
      <div
        className={`validation-errors ${className}`}
        style={styles.container}
      >
        <div style={styles.header}>
          <i className="ri-error-warning-line" style={styles.icon}></i>
          <span style={styles.title}>Please fix the following errors:</span>
        </div>
        <ul style={styles.list}>
          {errors.map((error, index) => (
            <li key={index} style={styles.listItem}>
              {error}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // Handle object of field errors
  const errorEntries = Object.entries(errors);
  if (errorEntries.length === 0) return null;

  return (
    <div className={`validation-errors ${className}`} style={styles.container}>
      <div style={styles.header}>
        <i className="ri-error-warning-line" style={styles.icon}></i>
        <span style={styles.title}>Please fix the following errors:</span>
      </div>
      <ul style={styles.list}>
        {errorEntries.map(([field, fieldErrors]) => (
          <li key={field} style={styles.listItem}>
            <strong style={styles.fieldName}>{formatFieldName(field)}:</strong>{" "}
            {Array.isArray(fieldErrors) ? fieldErrors[0] : fieldErrors}
          </li>
        ))}
      </ul>
    </div>
  );
};

/**
 * Inline Field Error Component
 */
interface FieldErrorProps {
  error?: string | null;
  className?: string;
}

export const FieldError: React.FC<FieldErrorProps> = ({
  error,
  className = "",
}) => {
  if (!error) return null;

  return (
    <div className={`field-error ${className}`} style={styles.fieldError}>
      <i className="ri-error-warning-line" style={styles.fieldErrorIcon}></i>
      <span>{error}</span>
    </div>
  );
};

/**
 * Format field name for display (snake_case to Title Case)
 */
function formatFieldName(field: string): string {
  return field
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    padding: "1rem",
    marginBottom: "1rem",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginBottom: "0.75rem",
  },
  icon: {
    color: "#dc2626",
    fontSize: "1.25rem",
  },
  title: {
    color: "#991b1b",
    fontWeight: 600,
    fontSize: "0.875rem",
  },
  list: {
    margin: 0,
    paddingLeft: "1.5rem",
    listStyle: "disc",
  },
  listItem: {
    color: "#7f1d1d",
    fontSize: "0.875rem",
    marginBottom: "0.25rem",
  },
  fieldName: {
    color: "#991b1b",
  },
  fieldError: {
    display: "flex",
    alignItems: "center",
    gap: "0.375rem",
    color: "#dc2626",
    fontSize: "0.75rem",
    marginTop: "0.25rem",
  },
  fieldErrorIcon: {
    fontSize: "0.875rem",
  },
};

export default ValidationErrors;
