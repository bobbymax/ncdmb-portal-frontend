import React, { FC, useEffect, useMemo, useState } from "react";
import {
  ProcessTypeDependencies,
  TabConfigContentProps,
} from "../../ContentBuilder";
import { TemplateProcessProps } from "app/Repositories/Template/data";
import useFormOnChangeEvents from "app/Hooks/useFormOnChangeEvents";
import MultiSelect, {
  DataOptionsProps,
} from "resources/views/components/forms/MultiSelect";
import { ActionMeta } from "react-select";
import { formatOptions } from "app/Support/Helpers";
import { GroupResponseData } from "app/Repositories/Group/data";

const FromStaffTabComponent: FC<
  TabConfigContentProps<"from", TemplateProcessProps>
> = ({
  value,
  icon,
  default: isDefault,
  data,
  label,
  handleStateUpdate,
  dependencies = {},
}) => {
  const fromState: TemplateProcessProps = {
    stage: null,
    process_type: value,
    group: null,
    department: null,
    staff: null,
    is_approving: false,
    permissions: "rw",
  };

  const { state, setState, handleChange, handleMultiSelectChange } =
    useFormOnChangeEvents<TemplateProcessProps>(fromState);

  const [accessibleGroups, setAccessibleGroups] = useState<DataOptionsProps[]>(
    []
  );
  const [selectedUsers, setSelectedUsers] = useState<DataOptionsProps[]>([]);

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
    handleStateUpdate(state, value);
  }, [state]);

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

export default FromStaffTabComponent;
