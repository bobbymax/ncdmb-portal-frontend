import { BudgetHeadResponseData } from "app/Repositories/BudgetHead/data";
import { SubBudgetHeadResponseData } from "app/Repositories/SubBudgetHead/data";
import { FormPageComponentProps } from "bootstrap";
import React, { useEffect, useState } from "react";
import MultiSelect, { DataOptionsProps } from "../components/forms/MultiSelect";
import { formatOptions } from "app/Support/Helpers";
import { ActionMeta } from "react-select";
import TextInput from "../components/forms/TextInput";
import Select from "../components/forms/Select";

interface DependencyProps {
  budgetHeads: BudgetHeadResponseData[];
}

const SubBudgetHead: React.FC<
  FormPageComponentProps<SubBudgetHeadResponseData>
> = ({
  mode,
  state,
  setState,
  handleChange,
  handleReactSelect,
  dependencies,
  loading,
}) => {
  const [budgetHeads, setBudgetHeads] = useState<DataOptionsProps[]>([]);
  const [selectedBudgetHead, setSelectedBudgetHead] =
    useState<DataOptionsProps | null>(null);

  const handleSelectChange = (
    newValue: unknown,
    actionMeta: ActionMeta<unknown>
  ) => {
    const updatedValue = newValue as DataOptionsProps;
    setSelectedBudgetHead(updatedValue);

    if (setState) {
      setState((prev) => ({ ...prev, budget_head_id: updatedValue.value }));
    }
  };

  useEffect(() => {
    if (dependencies) {
      const { budgetHeads = [] } = dependencies as DependencyProps;
      setBudgetHeads(formatOptions(budgetHeads, "id", "name"));
    }
  }, [dependencies]);

  useEffect(() => {
    if (
      mode === "update" &&
      Array.isArray(budgetHeads) &&
      state.budget_head_id > 0
    ) {
      const dataHead =
        budgetHeads.find((budget) => budget.value === state.budget_head_id) ??
        null;
      setSelectedBudgetHead(dataHead);
    }
  }, [mode, budgetHeads]);

  return (
    <>
      <div className="col-md-5 mb-3">
        <MultiSelect
          label="Budget Heads"
          options={budgetHeads}
          value={selectedBudgetHead}
          onChange={handleSelectChange}
          placeholder="Budget Head"
          isSearchable
          isDisabled={loading}
        />
      </div>
      <div className="col-md-7 mb-3">
        <TextInput
          label="Name"
          value={state.name}
          onChange={handleChange}
          isDisabled={loading}
          name="name"
          placeholder="Enter Sub Budget Head Name"
        />
      </div>
      <div className="col-md-4 mb-3">
        <Select
          label="Type"
          value={state.type}
          name="type"
          onChange={handleChange}
          options={[
            { label: "Capital", value: "capital" },
            { label: "Recurrent", value: "recurrent" },
            { label: "Personnel", value: "personnel" },
          ]}
          valueKey="value"
          labelKey="label"
          defaultValue=""
          defaultCheckDisabled
        />
      </div>
      <div className="col-md-4 mb-3">
        <Select
          label="Logistics Budget?"
          value={state.is_logistics}
          name="is_logistics"
          onChange={handleChange}
          options={[
            { label: "Yes", value: 1 },
            { label: "No", value: 0 },
          ]}
          valueKey="value"
          labelKey="label"
          defaultValue={999}
          defaultCheckDisabled
        />
      </div>
      <div className="col-md-4 mb-3">
        <Select
          label="Block Budget Access"
          value={state.is_blocked}
          name="is_blocked"
          onChange={handleChange}
          options={[
            { label: "Yes", value: 1 },
            { label: "No", value: 0 },
          ]}
          valueKey="value"
          labelKey="label"
          defaultValue={999}
          defaultCheckDisabled
        />
      </div>
    </>
  );
};

export default SubBudgetHead;
