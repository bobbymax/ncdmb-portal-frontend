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

  // Check if dependencies are ready - optimized to prevent excessive re-evaluation
  const isDependenciesReady = useMemo(() => {
    const hasStages = dependencies.stages && dependencies.stages.length > 0;
    const hasGroups = dependencies.groups && dependencies.groups.length > 0;
    const hasUsers = dependencies.users && dependencies.users.length > 0;

    return hasStages && hasGroups && hasUsers;
  }, [
    dependencies.stages?.length,
    dependencies.groups?.length,
    dependencies.users?.length,
  ]);

  // Memoize the dependencies to prevent unnecessary re-renders
  const memoizedDependencies = useMemo(
    () => ({
      stages: dependencies.stages || [],
      groups: dependencies.groups || [],
      users: dependencies.users || [],
    }),
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

  // Handle loading state with debouncing to prevent excessive loading changes
  useEffect(() => {
    if (!isDependenciesReady) {
      // Only show loading if dependencies aren't ready after a short delay
      const loadingTimeout = setTimeout(() => {
        setIsLoading(true);
      }, 200); // 200ms delay to prevent flash loading

      return () => clearTimeout(loadingTimeout);
    } else {
      // Immediately hide loading when dependencies are ready
      setIsLoading(false);
    }
  }, [isDependenciesReady]);

  // Handle errors - optimized to prevent unnecessary error state updates
  useEffect(() => {
    const hasStages = dependencies.stages && dependencies.stages.length > 0;

    if (!isLoading && !hasStages) {
      setError("No workflow stages available");
    } else if (error) {
      // Only update error state if there's actually an error to clear
      setError(null);
    }
  }, [dependencies.stages?.length, isLoading, error]);

  // Advanced error recovery and validation
  useEffect(() => {
    // Validate that the current state is consistent with available options
    if (state.stage && dependencies.stages.length > 0) {
      const stageExists = dependencies.stages.some(
        (s) => s.id === state.stage?.value
      );
      if (!stageExists) {
        setError(
          "Selected stage is no longer available. Please select a new stage."
        );
        return;
      }
    }

    if (state.group && accessibleGroups.length > 0) {
      const groupExists = accessibleGroups.some(
        (g) => g.value === state.group?.value
      );
      if (!groupExists) {
        setError(
          "Selected group is no longer available. Please select a new group."
        );
        return;
      }
    }

    if (state.staff && selectedUsers.length > 0) {
      const staffExists = selectedUsers.some(
        (u) => u.value === state.staff?.value
      );
      if (!staffExists) {
        setError(
          "Selected staff is no longer available. Please select a new staff member."
        );
        return;
      }
    }

    // Clear error if all validations pass
    if (error) {
      setError(null);
    }
  }, [
    state.stage,
    state.group,
    state.staff,
    dependencies.stages,
    accessibleGroups,
    selectedUsers,
    error,
  ]);

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
        <div className="process__flow__progress__container">
          <div className="process__flow__progress__bar">
            <div className="process__flow__progress__fill"></div>
          </div>
        </div>
        <small className="text-muted mt-2 d-block">
          Loading process configuration...
        </small>
        <div className="mt-3">
          <div
            className="spinner-border spinner-border-sm text-primary me-2"
            role="status"
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <span className="text-muted">Preparing form...</span>
        </div>
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
          formatOptions(stages, "id", "name", true),
          state.stage,
          handleMultiSelectChange("stage"),
          "Workflow Stage",
          isDisplay && !!state.stage?.value // Only disable in display mode if stage has a value
        )}

        {renderMultiSelect(
          "Group",
          accessibleGroups,
          state.group,
          handleMultiSelectChange("group"),
          "Group",
          isDisplay && !!state.group?.value // Only disable in display mode if group has a value
        )}

        {renderMultiSelect(
          "Staff",
          selectedUsers,
          state.staff ?? null,
          handleMultiSelectChange("staff"),
          "Staff",
          false,
          12
        )}
      </div>
    </ErrorBoundary>
  );
};

export default React.memo(ProcessTabBase) as typeof ProcessTabBase;
