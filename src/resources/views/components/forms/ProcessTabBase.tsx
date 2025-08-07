import React, { FC, useState, useEffect, useMemo } from "react";
import { ActionMeta } from "react-select";
import { TemplateProcessProps } from "app/Repositories/Template/data";
import {
  ProcessTypeDependencies,
  TabConfigContentProps,
} from "resources/views/crud/ContentBuilder";
import MultiSelect, { DataOptionsProps } from "./MultiSelect";
import { formatOptions } from "app/Support/Helpers";
import { useProcessState } from "app/Hooks/useProcessState";
import ErrorBoundary from "../ErrorBoundary";

const ProcessTabBase = <K extends "from" | "to" | "through">({
  value,
  icon,
  default: isDefault,
  data,
  label,
  handleStateUpdate,
  dependencies = { stages: [], groups: [], users: [] },
  isDisplay = false,
  configState,
}: TabConfigContentProps<K, TemplateProcessProps>) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if dependencies are ready
  const isDependenciesReady = useMemo(() => {
    return (
      dependencies.stages &&
      dependencies.groups &&
      dependencies.users &&
      dependencies.stages.length > 0 &&
      dependencies.groups.length > 0 &&
      dependencies.users.length > 0
    );
  }, [dependencies.stages, dependencies.groups, dependencies.users]);

  // Memoize the dependencies to prevent unnecessary re-renders
  const memoizedDependencies = useMemo(
    () => dependencies,
    [dependencies.stages, dependencies.groups, dependencies.users]
  );

  const {
    state,
    handleMultiSelectChange,
    handleStateChange,
    accessibleGroups,
    selectedUsers,
    stages,
  } = useProcessState({
    processType: value,
    dependencies: memoizedDependencies,
    isDisplay,
    handleStateUpdate,
    configState,
  });

  // Handle loading state
  useEffect(() => {
    if (!isDependenciesReady) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [isDependenciesReady]);

  // Handle errors
  useEffect(() => {
    if (!isLoading && dependencies.stages?.length === 0) {
      setError("No workflow stages available");
    } else {
      setError(null);
    }
  }, [dependencies.stages, isLoading]);

  const renderMultiSelect = (
    label: string,
    options: DataOptionsProps[],
    value: DataOptionsProps | null,
    onChange: (newValue: unknown, actionMeta: ActionMeta<unknown>) => void,
    placeholder: string,
    isDisabled: boolean = false,
    grid: number = 6,
    description: string = ""
  ) => (
    <div className={`col-md-${grid} mb-2`}>
      <MultiSelect
        label={label}
        options={options}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        isSearchable
        isDisabled={isDisabled || isLoading}
        description={description}
        aria-label={`Select ${label.toLowerCase()}`}
        aria-describedby={`${value}-${label.toLowerCase()}-description`}
      />
      {description && (
        <div
          id={`${value}-${label.toLowerCase()}-description`}
          className="sr-only"
        >
          {description}
        </div>
      )}
    </div>
  );

  if (error) {
    return (
      <div className="alert alert-warning" role="alert">
        <strong>Warning:</strong> {error}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center p-4">
        <div className="spinner-border" role="status">
          <span className="sr-only">Loading...</span>
        </div>
        <p className="mt-2">Loading process configuration...</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div
        className="row"
        role="group"
        aria-labelledby={`${value}-process-group`}
      >
        {renderMultiSelect(
          "Desk",
          formatOptions(stages, "id", "name"),
          state.stage,
          handleMultiSelectChange("stage", handleStateChange),
          "Workflow Stage",
          isDisplay && !!state.stage?.value // Only disable in display mode if stage has a value
        )}

        {renderMultiSelect(
          "Group",
          accessibleGroups,
          state.group,
          handleMultiSelectChange("group", handleStateChange),
          "Group",
          isDisplay && !!state.group?.value // Only disable in display mode if group has a value
        )}

        {renderMultiSelect(
          "Staff",
          selectedUsers,
          state.staff ?? null,
          handleMultiSelectChange("staff", handleStateChange),
          "Staff",
          false,
          12
        )}
      </div>
    </ErrorBoundary>
  );
};

export default React.memo(ProcessTabBase) as typeof ProcessTabBase;
