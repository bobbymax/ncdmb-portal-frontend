import React, { FC, useState, useEffect } from "react";
import { ActionMeta } from "react-select";
import { TemplateProcessProps } from "app/Repositories/Template/data";
import {
  ProcessTypeDependencies,
  TabConfigContentProps,
} from "resources/views/crud/ContentBuilder";
import MultiSelect, { DataOptionsProps } from "./MultiSelect";
import { formatOptions } from "app/Support/Helpers";
import ErrorBoundary from "../ErrorBoundary";

const ProcessTabBaseComponent = <K extends "from" | "to" | "through">({
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
  // NUCLEAR OPTION: Ultra-simple component with NO external dependencies

  // Simple state management
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize local state from props data for persistence
  const [localState, setLocalState] = useState<{
    stage: any;
    group: any;
    staff: any;
  }>(() => {
    // Use data prop if available, otherwise default to null
    if (data && !Array.isArray(data)) {
      return {
        stage: data.stage || null,
        group: data.group || null,
        staff: data.staff || null,
      };
    }
    return {
      stage: null,
      group: null,
      staff: null,
    };
  });

  // Simple handlers - no external dependencies
  const handleStageChange = (newValue: any) => {
    setLocalState((prev) => ({ ...prev, stage: newValue }));
    if (handleStateUpdate) {
      const updatedState: TemplateProcessProps = {
        process_type: value,
        stage: newValue,
        group: localState.group,
        staff: localState.staff,
        department: null,
        is_approving: null,
        permissions: "rw",
      };
      handleStateUpdate(updatedState, value);
    }
  };

  const handleGroupChange = (newValue: any) => {
    setLocalState((prev) => ({ ...prev, group: newValue }));
    if (handleStateUpdate) {
      const updatedState: TemplateProcessProps = {
        process_type: value,
        stage: localState.stage,
        group: newValue,
        staff: localState.staff,
        department: null,
        is_approving: null,
        permissions: "rw",
      };
      handleStateUpdate(updatedState, value);
    }
  };

  const handleStaffChange = (newValue: any) => {
    setLocalState((prev) => ({ ...prev, staff: newValue }));
    if (handleStateUpdate) {
      const updatedState: TemplateProcessProps = {
        process_type: value,
        stage: localState.stage,
        group: localState.group,
        staff: newValue,
        department: null,
        is_approving: null,
        permissions: "rw",
      };
      handleStateUpdate(updatedState, value);
    }
  };

  // Sync local state with data prop changes
  useEffect(() => {
    if (data && !Array.isArray(data)) {
      setLocalState({
        stage: data.stage || null,
        group: data.group || null,
        staff: data.staff || null,
      });
    }
  }, [data]);

  // Simple loading state
  useEffect(() => {
    if (
      dependencies.stages?.length > 0 &&
      dependencies.groups?.length > 0 &&
      dependencies.users?.length > 0
    ) {
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }, [
    dependencies.stages?.length,
    dependencies.groups?.length,
    dependencies.users?.length,
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
          formatOptions(dependencies.stages || [], "id", "name", true),
          localState.stage,
          handleStageChange,
          "Workflow Stage",
          isDisplay && !!localState.stage?.value
        )}

        {renderMultiSelect(
          "Group",
          formatOptions(dependencies.groups || [], "id", "name", true),
          localState.group,
          handleGroupChange,
          "Group",
          isDisplay && !!localState.group?.value
        )}

        {renderMultiSelect(
          "Staff",
          formatOptions(dependencies.users || [], "id", "name", true),
          localState.staff,
          handleStaffChange,
          "Staff",
          false,
          12
        )}
      </div>
    </ErrorBoundary>
  );
};

export default React.memo(
  ProcessTabBaseComponent
) as typeof ProcessTabBaseComponent;
