import { CarderResponseData } from "app/Repositories/Carder/data";
import { FormPageComponentProps } from "bootstrap";
import React, { useEffect, useMemo, useState } from "react";
import TextInput from "../components/forms/TextInput";
import { GroupResponseData } from "app/Repositories/Group/data";
import MultiSelect, { DataOptionsProps } from "../components/forms/MultiSelect";
import { formatOptions } from "app/Support/Helpers";
import { ActionMeta } from "react-select";

type DependencyProps = {
  groups: GroupResponseData[];
};

const Carder: React.FC<FormPageComponentProps<CarderResponseData>> = ({
  state,
  handleChange,
  dependencies,
  setState,
  handleReactSelect,
  loading,
  mode,
}) => {
  const [selectedGroups, setSelectedGroups] = useState<DataOptionsProps[]>([]);
  const groups = useMemo(() => {
    if (!dependencies) return [];
    const { groups } = dependencies as DependencyProps;
    return groups;
  }, [dependencies]);

  const handleGroupsChange = (
    newValue: unknown,
    actionMeta: ActionMeta<unknown>
  ) => {
    handleReactSelect(newValue, actionMeta, (value) => {
      const result = value as DataOptionsProps[];
      setSelectedGroups(result);

      const newGroupSet = groups.filter((group) =>
        result.some((selected) => selected.value === group.id)
      );

      if (setState) {
        setState((prev) => ({
          ...prev,
          groups: newGroupSet,
        }));
      }
    });
  };

  useEffect(() => {
    if (mode === "update") {
      setSelectedGroups(formatOptions(state.groups, "id", "name"));
    }
  }, [mode, state.groups]);

  return (
    <>
      <div className="col-md-12 mb-3">
        <TextInput
          label="Name"
          name="name"
          value={state.name}
          onChange={handleChange}
          placeholder="Enter Name"
        />
      </div>
      <div className="col-md-12">
        <MultiSelect
          label="Authorisers"
          options={formatOptions(groups, "id", "name")}
          value={selectedGroups}
          onChange={handleGroupsChange}
          placeholder="Groups"
          isSearchable
          isDisabled={loading}
          isMulti
        />
      </div>
    </>
  );
};

export default Carder;
