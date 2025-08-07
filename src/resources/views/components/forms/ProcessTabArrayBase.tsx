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
const generateUUID = (): string => {
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
  const [recipients, setRecipients] = useState<CCProcessProps[]>([]);
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

  // Handle recipients state updates - simplified to avoid infinite loops
  useEffect(() => {
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
      console.error("Error in recipients useEffect:", err);
      setError("Error updating recipients state");
    }
  }, [recipients, value]); // Removed handleStateUpdate from dependencies to prevent infinite loop

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
              is_approving: false,
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
        <div className="spinner-border" role="status">
          <span className="sr-only">Loading...</span>
        </div>
        <p className="mt-2">Loading process configuration...</p>
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
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default React.memo(ProcessTabArrayBase) as typeof ProcessTabArrayBase;
