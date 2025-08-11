import { useEffect, useRef, useState, useCallback } from "react";
import { TemplateProcessProps } from "app/Repositories/Template/data";
import { DataOptionsProps } from "resources/views/components/forms/MultiSelect";
import { ProcessTypeDependencies } from "resources/views/crud/ContentBuilder";
import { GroupResponseData } from "app/Repositories/Group/data";
import { formatOptions } from "app/Support/Helpers";
import { useAuth } from "app/Context/AuthContext";
import useFormOnChangeEvents from "./useFormOnChangeEvents";
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

  const initialState: TemplateProcessProps = {
    process_type: processType,
    stage: null,
    group: null,
    department: null,
    staff: null,
    is_approving: { label: "No", value: 0 },
    permissions: "rw",
  };

  const { state, setState, handleMultiSelectChange } =
    useFormOnChangeEvents<TemplateProcessProps>(initialState);

  const [accessibleGroups, setAccessibleGroups] = useState<DataOptionsProps[]>(
    []
  );
  const [selectedUsers, setSelectedUsers] = useState<DataOptionsProps[]>([]);
  const prevStateRef = useRef<TemplateProcessProps>(initialState);
  const configStateRef = useRef(configState);
  const handleStateUpdateRef = useRef(handleStateUpdate);

  // Update refs when props change
  useEffect(() => {
    configStateRef.current = configState;
    handleStateUpdateRef.current = handleStateUpdate;
  }, [configState, handleStateUpdate]);

  const { stages = [], groups = [], users = [] } = dependencies;
  const { filteredResources } = useAccessControl(users);

  // Memoize handleStateChange to prevent infinite loops
  const handleStateChange = useCallback(
    (
      updatedValue: DataOptionsProps | DataOptionsProps[] | null,
      key: keyof TemplateProcessProps
    ) => {
      setState((prev) => ({
        ...prev,
        [key]: updatedValue,
      }));
    },
    []
  );

  // Handle state updates and prevent infinite loops - only for single process types
  useEffect(() => {
    // Skip for array-based process types (cc, approvers)
    if (processType === "cc" || processType === "approvers") {
      return;
    }

    const hasChanged =
      prevStateRef.current.stage?.value !== state.stage?.value ||
      prevStateRef.current.group?.value !== state.group?.value ||
      prevStateRef.current.department?.value !== state.department?.value ||
      prevStateRef.current.staff?.value !== state.staff?.value;

    if (hasChanged) {
      const changedState: TemplateProcessProps = {
        ...state,
        department:
          (state.department as DataOptionsProps)?.value < 1 && isDisplay
            ? (staff?.department as DataOptionsProps | null)
            : state.department,
      };

      handleStateUpdateRef.current(changedState, processType);
      prevStateRef.current = { ...state };
    }
  }, [
    state.stage?.value,
    state.group?.value,
    state.department?.value,
    state.staff?.value,
    processType,
    isDisplay,
    staff?.department,
  ]);

  // Handle group filtering based on department
  useEffect(() => {
    if (state.group && groups.length > 0) {
      const group: GroupResponseData | undefined =
        groups.find((grp) => grp.id === state.group?.value) ?? undefined;

      if (!group) return;

      const matchingIds = new Set(
        filteredResources
          .filter((user) => user.department_id === state.department?.value)
          .map((user) => user.id)
      );

      const { users: staff = [] } = group;
      const selectedUsers = staff.filter((option) =>
        matchingIds.has(option.value)
      );

      const matchUsers = selectedUsers.length > 0 ? selectedUsers : staff;
      setSelectedUsers([{ label: "None", value: 0 }, ...matchUsers]);
    }
  }, [state.group, groups, state.department, filteredResources]);

  // Handle stage changes and set accessible groups
  useEffect(() => {
    if (state.stage && stages.length > 0) {
      const stage = stages.find((stg) => stg.id === state.stage?.value) ?? null;

      if (!stage) return;

      setAccessibleGroups(
        formatOptions(stage.groups, "id", "name", true) ?? []
      );
      handleStateChange(stage?.department ?? null, "department");
    }
  }, [state.stage, stages, handleStateChange]);

  // Handle config state updates - use ref to avoid infinite loops
  useEffect(() => {
    // Skip for array-based process types (cc, approvers)
    if (processType === "cc" || processType === "approvers") {
      return;
    }

    const currentConfigState = configStateRef.current;
    if (currentConfigState?.[processType]?.state) {
      const configData = currentConfigState[processType].state;

      // Only update if the data is actually different and not from a recent local change
      setState((prevState) => {
        const hasChanged =
          prevState.group?.value !== configData.group?.value ||
          prevState.staff?.value !== configData.staff?.value ||
          prevState.stage?.value !== configData.stage?.value ||
          prevState.department?.value !== configData.department?.value;

        // Prevent circular updates by checking if this is a recent local change
        const isRecentLocalChange =
          prevStateRef.current.stage?.value === configData.stage?.value &&
          prevStateRef.current.group?.value === configData.group?.value &&
          prevStateRef.current.staff?.value === configData.staff?.value &&
          prevStateRef.current.department?.value ===
            configData.department?.value;

        if (hasChanged && !isRecentLocalChange) {
          return {
            ...prevState,
            group: configData.group,
            staff: configData.staff,
            stage: configData.stage,
            department: configData.department,
          };
        }
        return prevState;
      });
    }
  }, [processType]);

  return {
    state,
    setState,
    handleMultiSelectChange,
    handleStateChange,
    accessibleGroups,
    selectedUsers,
    stages,
  };
};
