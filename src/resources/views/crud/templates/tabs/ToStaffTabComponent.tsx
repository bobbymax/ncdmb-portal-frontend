import { FC, useEffect, useMemo, useState, useRef } from "react";
import {
  ProcessTypeDependencies,
  TabConfigContentProps,
} from "../../ContentBuilder";
import { TemplateProcessProps } from "app/Repositories/Template/data";
import MultiSelect, {
  DataOptionsProps,
} from "resources/views/components/forms/MultiSelect";
import { ActionMeta } from "react-select";
import useFormOnChangeEvents from "app/Hooks/useFormOnChangeEvents";
import { formatOptions } from "app/Support/Helpers";
import { GroupResponseData } from "app/Repositories/Group/data";
import { useAuth } from "app/Context/AuthContext";

const ToStaffTabComponent: FC<
  TabConfigContentProps<"to", TemplateProcessProps>
> = ({
  value,
  icon,
  default: isDefault,
  data,
  label,
  handleStateUpdate,
  dependencies = {},
  isDisplay = false,
}) => {
  const { staff } = useAuth();

  const fromState: TemplateProcessProps = {
    process_type: value,
    stage: null,
    group: null,
    department: null,
    staff: null,
    is_approving: false,
    permissions: "rw",
  };

  const { state, setState, handleMultiSelectChange } =
    useFormOnChangeEvents<TemplateProcessProps>(fromState);
  const [accessibleGroups, setAccessibleGroups] = useState<DataOptionsProps[]>(
    []
  );
  const [selectedUsers, setSelectedUsers] = useState<DataOptionsProps[]>([]);
  const prevStateRef = useRef<TemplateProcessProps>(fromState);

  const {
    stages = [],
    groups = [],
    users = [],
  } = useMemo(() => dependencies as ProcessTypeDependencies, [dependencies]);

  const handleStateChange = (
    updatedValue: DataOptionsProps | DataOptionsProps[] | null,
    key: keyof TemplateProcessProps
  ) => {
    setState((prev) => ({
      ...prev,
      [key]: updatedValue,
    }));
  };

  useEffect(() => {
    // Check if state has actually changed to prevent infinite loops
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

      handleStateUpdate(changedState, value);
      prevStateRef.current = { ...state };
    }
  }, [
    state.stage?.value,
    state.group?.value,
    state.department?.value,
    state.staff?.value,
    value,
  ]);

  useEffect(() => {
    if (state.group && groups.length > 0) {
      const group: GroupResponseData | undefined =
        groups.find((grp) => grp.id === state.group?.value) ?? undefined;

      if (!group) return;

      const matchingIds = new Set(
        users
          .filter((user) => user.department_id === state.department?.value)
          .map((user) => user.id)
      );

      const { users: staff = [] } = group;
      const selectedUsers = staff.filter((option) =>
        matchingIds.has(option.value)
      );

      const matchUsers = selectedUsers.length > 0 ? selectedUsers : staff;
      setSelectedUsers(matchUsers);
    }
  }, [state.group, groups, state.department, users]);

  useEffect(() => {
    if (state.stage && stages.length > 0) {
      const stage = stages.find((stg) => stg.id === state.stage?.value) ?? null;

      if (!stage) return;

      setAccessibleGroups(formatOptions(stage.groups, "id", "name") ?? []);
      handleStateChange(stage?.department ?? null, "department");
    }
  }, [state.stage, stages]);

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
        isDisabled={isDisabled}
        description={description}
      />
    </div>
  );
  return (
    <div className="row">
      {renderMultiSelect(
        "Desk",
        formatOptions(stages, "id", "name"),
        state.stage,
        handleMultiSelectChange("stage", handleStateChange),
        "Worflow Stage"
      )}
      {renderMultiSelect(
        "Group",
        accessibleGroups,
        state.group,
        handleMultiSelectChange("group", handleStateChange),
        "Group"
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
  );
};

export default ToStaffTabComponent;
