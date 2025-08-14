import { useEffect, useRef, useState, useCallback } from "react";
import { TemplateProcessProps } from "app/Repositories/Template/data";
import { DataOptionsProps } from "resources/views/components/forms/MultiSelect";
import { ProcessTypeDependencies } from "resources/views/crud/ContentBuilder";
import { GroupResponseData } from "app/Repositories/Group/data";
import { formatOptions } from "app/Support/Helpers";
import { useAuth } from "app/Context/AuthContext";
import { ActionMeta } from "react-select";
import { useAccessControl } from "./useAccessControl";

interface UseProcessStateProps<
  K extends "from" | "to" | "through" | "cc" | "approvers"
> {
  processType: K;
  dependencies: ProcessTypeDependencies;
  isDisplay?: boolean;
  handleStateUpdate: (
    state: TemplateProcessProps | TemplateProcessProps[],
    value: K
  ) => void;
  configState?: any;
}

export const useProcessState = <
  K extends "from" | "to" | "through" | "cc" | "approvers"
>({
  processType,
  dependencies,
  isDisplay = false,
  handleStateUpdate,
  configState,
}: UseProcessStateProps<K>) => {
  const { staff } = useAuth();

  // Read directly from global configState instead of maintaining local state
  const currentState = configState?.[processType]?.state || {
    process_type: processType,
    stage: null,
    group: null,
    department: null,
    staff: null,
    is_approving: { label: "No", value: 0 },
    permissions: "rw",
  };

  const [accessibleGroups, setAccessibleGroups] = useState<DataOptionsProps[]>(
    []
  );
  const [selectedUsers, setSelectedUsers] = useState<DataOptionsProps[]>([]);
  const configStateRef = useRef(configState);
  const handleStateUpdateRef = useRef(handleStateUpdate);

  // Smart caching for expensive computations
  const computationCache = useRef<Map<string, any>>(new Map());

  // Update refs when props change
  useEffect(() => {
    configStateRef.current = configState;
    handleStateUpdateRef.current = handleStateUpdate;
  }, [configState, handleStateUpdate]);

  const { stages = [], groups = [], users = [] } = dependencies;
  const { filteredResources } = useAccessControl(users);

  // Advanced state validation function
  const validateStateUpdate = useCallback(
    (
      key: keyof TemplateProcessProps,
      value: DataOptionsProps | DataOptionsProps[] | null
    ): boolean => {
      // Handle array values (for cc, approvers process types)
      if (Array.isArray(value)) {
        return true; // Array validation can be added here if needed
      }

      // Handle single values
      if (value && typeof value === "object" && "value" in value) {
        // Validate stage selection
        if (key === "stage") {
          const stage = stages.find((s) => s.id === value.value);
          if (!stage) {
            console.warn(`Invalid stage selected: ${value.value}`);
            return false;
          }
        }

        // Validate group selection
        if (key === "group") {
          const group = groups.find((g) => g.id === value.value);
          if (!group) {
            console.warn(`Invalid group selected: ${value.value}`);
            return false;
          }
        }

        // Validate staff selection
        if (key === "staff") {
          const user = users.find((u) => u.id === value.value);
          if (!user) {
            console.warn(`Invalid staff selected: ${value.value}`);
            return false;
          }
        }

        // Validate department selection
        if (key === "department") {
          // Department validation logic can be added here
          return true;
        }
      }

      return true;
    },
    [stages, groups, users]
  );

  // Memoize handleStateChange to prevent infinite loops
  const handleStateChange = useCallback(
    (
      updatedValue: DataOptionsProps | DataOptionsProps[] | null,
      key: keyof TemplateProcessProps
    ) => {
      try {
        // Validate the state update before applying it
        if (!validateStateUpdate(key, updatedValue)) {
          console.warn(
            `State update validation failed for ${processType}.${key}`
          );
          return;
        }

        // Update global state directly instead of local state
        const updatedState = {
          ...currentState,
          [key]: updatedValue,
        };

        // Call the global state update function
        handleStateUpdateRef.current(updatedState, processType);
      } catch (error) {
        console.error(`Error updating state for ${processType}.${key}:`, error);
      }
    },
    [currentState, processType, validateStateUpdate]
  );

  // Create handleMultiSelectChange that works with global state
  const handleMultiSelectChange = useCallback(
    (key: keyof TemplateProcessProps) =>
      (newValue: unknown, actionMeta: ActionMeta<unknown>) => {
        handleStateChange(
          newValue as DataOptionsProps | DataOptionsProps[] | null,
          key
        );
      },
    [handleStateChange]
  );

  // COMPLETE OVERHAUL: Remove all problematic useEffects that cause infinite loops

  // Handle group filtering based on department - STABILIZED
  useEffect(() => {
    if (currentState.group?.value && groups.length > 0) {
      const group: GroupResponseData | undefined =
        groups.find((grp) => grp.id === currentState.group?.value) ?? undefined;

      if (!group) return;

      const matchingIds = new Set(
        filteredResources
          .filter(
            (user) => user.department_id === currentState.department?.value
          )
          .map((user) => user.id)
      );

      const { users: staff = [] } = group;
      const selectedUsers = staff.filter((option) =>
        matchingIds.has(option.value)
      );

      const matchUsers = selectedUsers.length > 0 ? selectedUsers : staff;
      setSelectedUsers([{ label: "None", value: 0 }, ...matchUsers]);
    }
  }, [
    currentState.group?.value, // Use primitive value instead of object
    groups.length, // Use primitive value instead of array
    currentState.department?.value, // Use primitive value instead of object
    filteredResources.length, // Use primitive value instead of array
  ]);

  // Handle stage changes and set accessible groups - STABILIZED
  useEffect(() => {
    if (currentState.stage?.value && stages.length > 0) {
      const stage =
        stages.find((stg) => stg.id === currentState.stage?.value) ?? null;

      if (!stage) return;

      setAccessibleGroups(
        formatOptions(stage.groups, "id", "name", true) ?? []
      );

      // Only auto-set department if it's not already set by the user
      if (!currentState.department?.value) {
        // Use setTimeout to break the synchronous update chain
        setTimeout(() => {
          handleStateChange(stage?.department ?? null, "department");
        }, 0);
      }
    }
  }, [
    currentState.stage?.value, // Use primitive value instead of object
    stages.length, // Use primitive value instead of array
    currentState.department?.value, // Use primitive value instead of object
  ]);

  return {
    state: currentState,
    setState: (newState: TemplateProcessProps) => {
      // For array-based process types, we need to handle state updates differently
      if (processType === "cc" || processType === "approvers") {
        // For array types, we need to handle the state update through the parent
        // This is a special case that needs custom handling
        console.warn(
          `setState called for array process type ${processType}. This should be handled by the parent component.`
        );
        return;
      }

      // For single process types, update global state
      handleStateUpdateRef.current(newState, processType);
    },
    handleMultiSelectChange,
    handleStateChange,
    accessibleGroups,
    selectedUsers,
    stages,
  };
};
