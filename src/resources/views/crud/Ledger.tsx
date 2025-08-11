import { LedgerResponseData } from "app/Repositories/Ledger/data";
import { FormPageComponentProps } from "bootstrap";
import React, { useCallback, useEffect, useState } from "react";
import MultiSelect, { DataOptionsProps } from "../components/forms/MultiSelect";
import { ActionMeta } from "react-select";
import { formatOptions } from "app/Support/Helpers";
import TextInput from "../components/forms/TextInput";
import Textarea from "../components/forms/Textarea";
import { GroupResponseData } from "app/Repositories/Group/data";

type DependencyProps = {
  groups: GroupResponseData[];
};

const Ledger: React.FC<FormPageComponentProps<LedgerResponseData>> = ({
  state,
  setState,
  handleChange,
  dependencies,
  loading,
  mode,
}) => {
  const [groups, setGroups] = useState<GroupResponseData[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<{
    groups: DataOptionsProps[];
    code: DataOptionsProps | null;
  }>({
    groups: [],
    code: null,
  });

  const ledgerList = () => {
    const list: DataOptionsProps[] = [];
    const range = Array.from({ length: 11 }, (_, i) =>
      String.fromCharCode(65 + i)
    );

    range.map((letter) =>
      list.push({
        value: letter,
        label: `Ledger ${letter}`,
      })
    );

    return list;
  };

  const handleSelectionChange = useCallback(
    (key: "groups" | "code") => (newValue: unknown) => {
      const updatedValue =
        key === "groups"
          ? (newValue as DataOptionsProps[])
          : (newValue as DataOptionsProps);
      setSelectedOptions((prev) => ({ ...prev, [key]: updatedValue }));

      const selectedGroups = Array.isArray(updatedValue)
        ? groups.filter((group) =>
            updatedValue.some((item) => item.value === group.id)
          )
        : [];

      if (setState) {
        setState((prev) => ({
          ...prev,
          [key]:
            key === "groups"
              ? selectedGroups
              : !Array.isArray(updatedValue)
              ? updatedValue.value
              : "",
        }));
      }
    },
    [setState, groups]
  );

  useEffect(() => {
    if (dependencies) {
      const { groups = [] } = dependencies as DependencyProps;
      setGroups(groups);
    }
  }, [dependencies]);

  useEffect(() => {
    if (mode === "update" && state.groups.length > 0) {
      setSelectedOptions((prev) => ({
        ...prev,
        groups: formatOptions(state.groups, "id", "name"),
        code: { value: state.code, label: `Ledger ${state.code}` },
      }));
    }
  }, [mode, state.code, state.groups]);

  const renderMultiSelect = (
    label: string,
    options: DataOptionsProps[],
    value: DataOptionsProps[] | DataOptionsProps | null,
    onChange: (newValue: unknown, actionMeta: ActionMeta<unknown>) => void,
    placeholder: string,
    grid: number = 4,
    isMulti: boolean = false
  ) => (
    <div className={`col-md-${grid} mb-3`}>
      <MultiSelect
        label={label}
        options={options}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        isSearchable
        isDisabled={loading}
        isMulti={isMulti}
      />
    </div>
  );

  return (
    <>
      {renderMultiSelect(
        "Ledger",
        ledgerList(),
        selectedOptions.code,
        handleSelectionChange("code"),
        "Category",
        5
      )}

      <div className="col-md-7 mb-3">
        <TextInput
          label="Name"
          value={state.name}
          name="name"
          onChange={handleChange}
          isDisabled={loading}
          placeholder="Enter Ledger Name"
        />
      </div>
      <div className="col-md-12 mb-3">
        <Textarea
          label="Description"
          value={state.description}
          name="description"
          onChange={handleChange}
          rows={4}
          isDisabled={loading}
          placeholder="Enter Description Here!!"
        />
      </div>
      {renderMultiSelect(
        "Groups",
        formatOptions(groups, "id", "name"),
        selectedOptions.groups,
        handleSelectionChange("groups"),
        "Groups",
        12,
        true
      )}
    </>
  );
};

export default Ledger;
