import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import {
  ProcessTypeDependencies,
  TabConfigContentProps,
} from "../../ContentBuilder";
import { TemplateProcessProps } from "app/Repositories/Template/data";
import Button from "resources/views/components/forms/Button";
import MultiSelect, {
  DataOptionsProps,
} from "resources/views/components/forms/MultiSelect";
import { ActionMeta } from "react-select";
import useFormOnChangeEvents from "app/Hooks/useFormOnChangeEvents";
import { formatOptions } from "app/Support/Helpers";
import { GroupResponseData } from "app/Repositories/Group/data";
import { isEqual } from "lodash";

export type CCProcessProps = {
  id: string;
  recipient: TemplateProcessProps;
};

const CCStaffComponent: FC<
  TabConfigContentProps<"cc", TemplateProcessProps[]>
> = ({
  value,
  icon,
  default: isDefault,
  data,
  label,
  handleStateUpdate,
  dependencies = {},
}) => {
  const [isToggled, setIsToggled] = useState(false);
  const ccState: TemplateProcessProps = {
    stage: null,
    process_type: value,
    group: null,
    department: null,
    staff: null,
    is_approving: false,
    permissions: "rw",
  };

  const { state, setState, handleMultiSelectChange } =
    useFormOnChangeEvents<TemplateProcessProps>(ccState);

  const [accessibleGroups, setAccessibleGroups] = useState<DataOptionsProps[]>(
    []
  );
  const [selectedUsers, setSelectedUsers] = useState<DataOptionsProps[]>([]);
  const [recipients, setRecipients] = useState<CCProcessProps[]>([]);

  const {
    stages = [],
    groups = [],
    users = [],
  } = useMemo(() => dependencies as ProcessTypeDependencies, [dependencies]);

  const handleToggleAndStateUpdate = useCallback(
    (key: "open" | "close") => {
      setIsToggled((prev) => !prev); // Always toggle

      if (key === "close") {
        const isModified =
          state.department !== null ||
          state.group !== null ||
          state.stage !== null;

        // Only add if state has been modified
        if (isModified) {
          const recidentDetails: CCProcessProps = {
            id: crypto.randomUUID(),
            recipient: state,
          };
          setRecipients((prev) => [recidentDetails, ...prev]);
          setState(ccState); // reset after adding
        } else {
          // Just close the modal, don't reset or add anything
          console.log("State is unchanged — not saving");
        }
      }
    },
    [state, ccState]
  );

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
    if (recipients.length > 0) {
      handleStateUpdate(
        recipients.map((recip) => recip.recipient),
        value
      );
    }
  }, [recipients]);

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
      <div className="col-md-12 mb-2">
        <div className="flex align end">
          <Button
            label={`${isToggled ? "Add" : "CC"}`}
            handleClick={() =>
              handleToggleAndStateUpdate(!isToggled ? "open" : "close")
            }
            icon={`${isToggled ? "ri-send-plane-fill" : "ri-broadcast-line"}`}
            size="xs"
            variant={`${isToggled ? "success" : "dark"}`}
          />
        </div>
      </div>
      <div className="col-md-12 mb-3">
        <div className="cc__list__container flex align gap-md">
          {recipients.length > 0 ? (
            recipients.map((recip, idx) => (
              <div
                className="cc__distribution__item flex align gap-md"
                key={idx}
              >
                <p className="div__name">{recip?.recipient?.group?.label}</p>
                <Button
                  icon="ri-close-large-line"
                  handleClick={() =>
                    setRecipients(recipients.filter((rp) => rp.id !== recip.id))
                  }
                  variant="danger"
                  size="xs"
                />
              </div>
            ))
          ) : (
            <p>No Recipients have been added!!</p>
          )}
        </div>
      </div>
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
        </div>
      </div>
    </div>
  );
};

export default CCStaffComponent;
