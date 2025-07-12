import { FC, useMemo } from "react";
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
}) => {
  const fromState: TemplateProcessProps = {
    process_type: value,
    group: null,
    department: null,
    staff: null,
    is_approving: false,
    permissions: "rw",
  };

  const { state, setState, handleChange, handleMultiSelectChange } =
    useFormOnChangeEvents<TemplateProcessProps>(fromState);

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
  );
};

export default ToStaffTabComponent;
