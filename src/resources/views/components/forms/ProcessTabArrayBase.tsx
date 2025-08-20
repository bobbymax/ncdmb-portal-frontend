import React, {
  FC,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { ActionMeta } from "react-select";
import { TemplateProcessProps } from "app/Repositories/Template/data";
import { TabConfigContentProps } from "resources/views/crud/ContentBuilder";
import MultiSelect, { DataOptionsProps } from "./MultiSelect";
import { formatOptions } from "app/Support/Helpers";
import { useProcessState } from "app/Hooks/useProcessState";
import ErrorBoundary from "../ErrorBoundary";
import Button from "./Button";

export type CCProcessProps = {
  id: string;
  recipient: TemplateProcessProps;
};

type ProcessTabArrayBaseProps<K extends "cc" | "approvers"> =
  TabConfigContentProps<K, TemplateProcessProps[]> & {
    buttonLabel: string;
    emptyMessage: string;
  };

// Simple UUID generator
export const generateUUID = (): string => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const ProcessTabArrayBase = <K extends "cc" | "approvers">({
  value,
  icon,
  default: isDefault,
  data,
  label,
  handleStateUpdate,
  dependencies = { stages: [], groups: [], users: [] },
  isDisplay = false,
  configState,
  buttonLabel,
  emptyMessage,
}: ProcessTabArrayBaseProps<K>) => {
  const [isToggled, setIsToggled] = useState(false);
  const [recipients, setRecipients] = useState<CCProcessProps[]>(() => {
    // Initialize recipients from data prop for persistence
    if (data && Array.isArray(data) && data.length > 0) {
      return (data as TemplateProcessProps[]).map((item) => ({
        id: generateUUID(),
        recipient: item,
      }));
    }
    return [];
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // COMPLETE OVERHAUL: Ultra-stable dependency checking

  // Check if dependencies are ready - ULTRA-STABILIZED with primitive values
  const isDependenciesReady = useMemo(() => {
    const hasStages = dependencies.stages && dependencies.stages.length > 0;
    const hasGroups = dependencies.groups && dependencies.groups.length > 0;
    const hasUsers = dependencies.users && dependencies.users.length > 0;

    return hasStages && hasGroups && hasUsers;
  }, [
    dependencies.stages?.length || 0, // Use primitive value
    dependencies.groups?.length || 0, // Use primitive value
    dependencies.users?.length || 0, // Use primitive value
  ]);

  const {
    state,
    setState,
    handleMultiSelectChange,
    handleStateChange,
    accessibleGroups,
    selectedUsers,
    stages,
  } = useProcessState({
    processType: value,
    dependencies,
    isDisplay,
    handleStateUpdate: () => {
      // We don't use the default handleStateUpdate for array components
      // We handle state updates through the recipients useEffect
    },
    configState,
  });

  // COMPLETE OVERHAUL: Ultra-stable loading state management

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
  }, [isDependenciesReady]); // isDependenciesReady is already stable

  // Sync recipients with data prop changes for persistence
  useEffect(() => {
    if (data && Array.isArray(data) && data.length > 0) {
      const newRecipients = (data as TemplateProcessProps[]).map((item) => ({
        id: generateUUID(),
        recipient: item,
      }));
      setRecipients(newRecipients);
    }
  }, [data]);

  // COMPLETE OVERHAUL: Ultra-stable error handling

  // Handle errors - ULTRA-STABILIZED with primitive dependencies
  useEffect(() => {
    const hasStages = dependencies.stages && dependencies.stages.length > 0;

    if (!isLoading && !hasStages) {
      setError("No workflow stages available");
    } else if (error) {
      // Only update error state if there's actually an error to clear
      setError(null);
    }
  }, [
    dependencies.stages?.length || 0, // Use primitive value
    isLoading, // Use primitive value
    error, // Keep error as it's a primitive string
  ]);

  // COMPLETE OVERHAUL: Remove problematic useEffect that causes infinite loops

  // Handle recipients state updates - STABILIZED with useCallback
  const updateRecipientsState = useCallback(() => {
    try {
      if (recipients.length > 0) {
        handleStateUpdate(
          recipients.map((recip) => recip.recipient),
          value
        );
      } else {
        // Send empty array when no recipients
        handleStateUpdate([], value);
      }
    } catch (err) {
      console.error("Error in recipients update:", err);
      setError("Error updating recipients state");
    }
  }, [recipients, value, handleStateUpdate]);

  // Only update when recipients actually change - use useRef to track previous value
  const prevRecipientsRef = useRef(recipients);

  useEffect(() => {
    // Only update if recipients actually changed
    if (
      JSON.stringify(prevRecipientsRef.current) !== JSON.stringify(recipients)
    ) {
      prevRecipientsRef.current = recipients;
      updateRecipientsState();
    }
  }, [recipients, updateRecipientsState]);

  // Handle config state updates
  // Temporarily disabled to isolate the infinite loop issue
  /*
  useEffect(() => {
    
    try {
      if (configState?.[value]?.state) {
        const configData = configState[value].state;

        // Check if configData is an array
        if (Array.isArray(configData)) {
  
          
          // Check if the recipients are already the same to prevent unnecessary updates
          const newRecipients = configData.map((state: TemplateProcessProps) => ({
            id: generateUUID(),
            recipient: state,
          }));
          
          // Only update if the recipients are actually different
          const currentRecipientsString = JSON.stringify(recipients.map(r => r.recipient));
          const newRecipientsString = JSON.stringify(newRecipients.map(r => r.recipient));
          
          if (currentRecipientsString !== newRecipientsString) {
            setRecipients(newRecipients);
          } else {

          }
        } else {
          // If it's not an array, initialize with empty array
          console.warn(
            `Config state for ${value} is not an array:`,
            configData
          );
          setRecipients([]);
        }
      }
    } catch (err) {
      console.error("Error in config state useEffect:", err);
      setError("Error loading config state");
    }
  }, [configState, value]);
  */

  const handleToggleAndStateUpdate = useCallback(
    (key: "open" | "close") => {
      try {
        setIsToggled((prev) => !prev);

        if (key === "close") {
          const isModified =
            state.department !== null ||
            state.group !== null ||
            state.stage !== null;

          if (isModified) {
            const recipientDetails: CCProcessProps = {
              id: generateUUID(),
              recipient: state,
            };
            setRecipients((prev) => [recipientDetails, ...prev]);

            // Reset state after adding
            setState({
              process_type: value,
              stage: null,
              group: null,
              department: null,
              staff: null,
              is_approving: null,
              permissions: "rw",
            });
          }
        }
      } catch (err) {
        console.error("Error in handleToggleAndStateUpdate:", err);
        setError("Error handling toggle and state update");
      }
    },
    [state, value, setState]
  );

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
      <div className="row">
        <div className="col-md-12 mb-2">
          <div className="flex align end">
            <Button
              label={`${isToggled ? "Add" : buttonLabel}`}
              handleClick={() =>
                handleToggleAndStateUpdate(!isToggled ? "open" : "close")
              }
              icon={`${isToggled ? "ri-send-plane-fill" : "ri-broadcast-line"}`}
              size="xs"
              variant={`${isToggled ? "success" : "dark"}`}
            />
          </div>
        </div>

        {!isToggled && (
          <div className="col-md-12 mb-3">
            <div className="cc__list__container flex align gap-md">
              {recipients.length > 0 ? (
                recipients.map((recip, idx) => (
                  <div
                    className="cc__distribution__item flex align gap-md"
                    key={recip.id}
                  >
                    <p className="div__name">
                      {recip?.recipient?.group?.label}
                    </p>
                    <Button
                      icon="ri-close-large-line"
                      handleClick={() =>
                        setRecipients(
                          recipients.filter((rp) => rp.id !== recip.id)
                        )
                      }
                      variant="danger"
                      size="xs"
                    />
                  </div>
                ))
              ) : (
                <p>{emptyMessage}</p>
              )}
            </div>
          </div>
        )}

        <div className="col-md-12 mb-3">
          <div
            className="form__block"
            style={{
              display: isToggled ? "block" : "none",
            }}
          >
            <div className="row">
              {renderMultiSelect(
                "Desk",
                formatOptions(stages, "id", "name"),
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
                7
              )}
              {renderMultiSelect(
                "Should Sign",
                [
                  { label: "Yes", value: true },
                  { label: "No", value: false },
                ],
                state.is_approving ?? null,
                handleMultiSelectChange("is_approving"),
                "Signature",
                false,
                5
              )}
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default React.memo(ProcessTabArrayBase) as typeof ProcessTabArrayBase;
