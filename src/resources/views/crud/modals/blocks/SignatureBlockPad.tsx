import { BlockModalProps, useModal } from "app/Context/ModalContext";
import { SignaturePadGroupProps } from "app/Hooks/useBuilder";
import useFormOnChangeEvents from "app/Hooks/useFormOnChangeEvents";
import { CarderResponseData } from "app/Repositories/Carder/data";
import { DepartmentResponseData } from "app/Repositories/Department/data";
import { GroupResponseData } from "app/Repositories/Group/data";
import { UserResponseData } from "app/Repositories/User/data";
import { formatOptions } from "app/Support/Helpers";
import React, { useMemo } from "react";
import { ActionMeta } from "react-select";
import Button from "resources/views/components/forms/Button";
import MultiSelect, {
  DataOptionsProps,
} from "resources/views/components/forms/MultiSelect";
import Select from "resources/views/components/forms/Select";
import TextInput from "resources/views/components/forms/TextInput";

export type SignatureApprovalBlockProps = {
  users: UserResponseData[];
  departments: DepartmentResponseData[];
  groups: GroupResponseData[];
  carders: CarderResponseData[];
};

export type ExtraProps = {
  extras: SignatureApprovalBlockProps;
};

const SignatureBlockPad: React.FC<BlockModalProps<"approval">> = ({
  type,
  blockState,
  isUpdating,
  addBlockComponent,
  dependencies,
}) => {
  const { users, departments, groups, carders } = useMemo(() => {
    const { extras = {} } = (dependencies ?? {}) as ExtraProps;
    const extraObjs = extras as SignatureApprovalBlockProps;

    return {
      users: extraObjs.users ?? [],
      departments: extraObjs.departments ?? [],
      groups: extraObjs.groups,
      carders: extraObjs.carders ?? [],
    };
  }, [dependencies]);

  const { state, setState, handleChange, handleMultiSelectChange } =
    useFormOnChangeEvents<SignaturePadGroupProps>({
      identifier: "",
      group: null,
      department: null,
      fallback_group: null,
      approver: null,
      order: 0,
      approval_type: "initiator",
      carder_id: 0,
      make_comment: 0,
      is_signed: false,
      can_override: false,
      signatory: null,
    });

  const handleStateChange = (
    updatedValue: DataOptionsProps | DataOptionsProps[],
    key: keyof SignaturePadGroupProps
  ) => {
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
    grid: number = 4,
    description: string = ""
  ) => (
    <div className={`col-md-${grid} mb-3`}>
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
    <div className="approval__area">
      <div className="row">
        {renderMultiSelect(
          "Group",
          formatOptions(groups, "id", "name"),
          state.group,
          handleMultiSelectChange("group", handleStateChange),
          "Group"
        )}
        {renderMultiSelect(
          "Fallback Group",
          formatOptions(groups, "id", "name", true),
          state.fallback_group,
          handleMultiSelectChange("fallback_group", handleStateChange),
          "Fallback Approver",
          state?.approval_type === "initiator"
        )}
        {renderMultiSelect(
          "Approver",
          formatOptions(users, "id", "name", true),
          state.approver,
          handleMultiSelectChange("approver", handleStateChange),
          "Approver"
        )}
        {renderMultiSelect(
          "Department",
          formatOptions(departments, "id", "name"),
          state.department,
          handleMultiSelectChange("department", handleStateChange),
          "Department",
          false,
          7
        )}
        <div className="col-md-5 mb-3">
          <TextInput
            label="Order of Approval"
            name="order"
            type="number"
            value={state.order}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-4 mb-3">
          <Select
            label="Type"
            name="approval_type"
            valueKey="value"
            labelKey="label"
            value={state.approval_type}
            onChange={handleChange}
            options={[
              { value: "initiator", label: "Initiator" },
              { value: "witness", label: "Witness" },
              { value: "attestation", label: "Attestation" },
              { value: "approval", label: "Approval" },
              { value: "agreement", label: "Agreement" },
            ]}
            defaultValue=""
            defaultCheckDisabled
          />
        </div>
        <div className="col-md-4 mb-3">
          <Select
            label="Carder"
            name="carder_id"
            valueKey="id"
            labelKey="name"
            value={state.carder_id}
            onChange={handleChange}
            options={carders}
            defaultValue=""
            defaultCheckDisabled
          />
        </div>
        <div className="col-md-4 mb-3">
          <Select
            label="Can Make Comment"
            name="make_comment"
            valueKey="id"
            labelKey="name"
            value={state.make_comment}
            onChange={handleChange}
            options={[
              { id: 1, name: "Yes" },
              { id: 0, name: "No" },
            ]}
            defaultValue=""
            defaultCheckDisabled
          />
        </div>
        <div className="col-md-12 mb-3">
          <Button
            label={`${isUpdating ? "Update" : "Add"} Approval Block`}
            icon={isUpdating ? "ri-edit-2-fill" : "ri-add-line"}
            size="sm"
            variant="dark"
            handleClick={() => addBlockComponent(state)}
          />
        </div>
      </div>
    </div>
  );
};

export default SignatureBlockPad;
