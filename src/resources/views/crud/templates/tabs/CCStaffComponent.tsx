import React, { FC, useMemo, useState } from "react";
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

export type CCProcessProps = {
  recipients: TemplateProcessProps[];
};

const CCStaffComponent: FC<TabConfigContentProps<"cc", CCProcessProps>> = ({
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
    process_type: value,
    group: null,
    department: null,
    staff: null,
    is_approving: false,
    permissions: "rw",
  };

  const { state, setState, handleChange, handleMultiSelectChange } =
    useFormOnChangeEvents<TemplateProcessProps>(ccState);

  const {
    users = [],
    groups = [],
    departments = [],
  } = useMemo(() => dependencies as ProcessTypeDependencies, [dependencies]);

  const handleStateChange = (
    updatedValue: DataOptionsProps | DataOptionsProps[],
    key: keyof TemplateProcessProps
  ) => {
    console.log("Updated Value:", updatedValue);

    setState((prev) => ({
      ...prev,
      [key]: updatedValue,
    }));
  };

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
            handleClick={() => setIsToggled(!isToggled)}
            icon={`${isToggled ? "ri-send-plane-fill" : "ri-broadcast-line"}`}
            size="xs"
            variant={`${isToggled ? "success" : "dark"}`}
          />
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
              "Staff",
              formatOptions(users, "id", "name", true),
              state.staff ?? null,
              handleMultiSelectChange("staff", handleStateChange),
              "Staff",
              false,
              12
            )}
            {renderMultiSelect(
              "Group",
              formatOptions(groups, "id", "name"),
              state.group,
              handleMultiSelectChange("group", handleStateChange),
              "Group"
            )}
            {renderMultiSelect(
              "Department",
              formatOptions(departments, "id", "abv"),
              state.department,
              handleMultiSelectChange("department", handleStateChange),
              "Department"
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CCStaffComponent;
