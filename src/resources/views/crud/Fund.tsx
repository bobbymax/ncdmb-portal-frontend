import { BudgetCodeResponseData } from "app/Repositories/BudgetCode/data";
import { DepartmentResponseData } from "app/Repositories/Department/data";
import { FundResponseData } from "app/Repositories/Fund/data";
import { SubBudgetHeadResponseData } from "app/Repositories/SubBudgetHead/data";
import { FormPageComponentProps } from "bootstrap";
import React, { useCallback, useEffect, useState } from "react";
import MultiSelect, { DataOptionsProps } from "../components/forms/MultiSelect";
import { formatOptions } from "app/Support/Helpers";
import { ActionMeta } from "react-select";
import Select from "../components/forms/Select";
import TextInput from "../components/forms/TextInput";

interface DependencyProps {
  subBudgetHeads: SubBudgetHeadResponseData[];
  departments: DepartmentResponseData[];
  budgetCodes: BudgetCodeResponseData[];
}

const Fund: React.FC<FormPageComponentProps<FundResponseData>> = ({
  state,
  setState,
  handleChange,
  dependencies,
  loading,
  mode,
}) => {
  const [subHeads, setSubHeads] = useState<SubBudgetHeadResponseData[]>([]);
  const [codes, setCodes] = useState<BudgetCodeResponseData[]>([]);
  const [departments, setDepartments] = useState<DepartmentResponseData[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<{
    sub_budget_head: DataOptionsProps | null;
    department: DataOptionsProps | null;
    budget_code: DataOptionsProps | null;
  }>({
    sub_budget_head: null,
    department: null,
    budget_code: null,
  });

  const handleSelectionChange = useCallback(
    (key: keyof typeof selectedOptions) =>
      (newValue: unknown, actionMeta: ActionMeta<unknown>) => {
        const updatedValue = newValue as DataOptionsProps;

        // Update modal state dynamically
        if (setState) {
          setState((prev) => ({ ...prev, [`${key}_id`]: updatedValue }));
        }

        setSelectedOptions((prev) => ({ ...prev, [key]: updatedValue }));
      },
    [setState]
  );

  useEffect(() => {
    if (dependencies) {
      const {
        subBudgetHeads = [],
        departments = [],
        budgetCodes = [],
      } = dependencies as DependencyProps;
      setCodes(budgetCodes);
      setDepartments(departments);
      setSubHeads(subBudgetHeads);
    }
  }, [dependencies]);

  useEffect(() => {
    if (
      mode === "update" &&
      state.sub_budget_head_id > 0 &&
      state.department_id > 0 &&
      state.budget_code_id > 0 &&
      subHeads.length > 0 &&
      departments.length > 0 &&
      codes.length > 0
    ) {
      const sub_budget_head =
        subHeads.find((sub) => sub.id === state.sub_budget_head_id) ?? null;
      const department =
        departments.find(
          (department) => department.id === state.department_id
        ) ?? null;
      const budget_code =
        codes.find((code) => code.id === state.budget_code_id) ?? null;

      setSelectedOptions((prev) => ({
        ...prev,
        sub_budget_head: sub_budget_head
          ? { value: sub_budget_head.id, label: sub_budget_head.name }
          : null,
        department: department
          ? { value: department.id, label: department.abv }
          : null,
        budget_code: budget_code
          ? { value: budget_code.id, label: budget_code.code }
          : null,
      }));
    }
  }, [
    mode,
    state.sub_budget_head_id,
    state.department_id,
    state.budget_code_id,
    subHeads,
    departments,
    codes,
  ]);

  return (
    <>
      <div className="col-md-4 mb-3">
        <MultiSelect
          label="Sub Budget Heads"
          options={formatOptions(subHeads, "id", "name")}
          value={selectedOptions.sub_budget_head}
          onChange={handleSelectionChange("sub_budget_head")}
          placeholder="Sub Budget Heads"
          isSearchable
          isDisabled
        />
      </div>
      <div className="col-md-4 mb-3">
        <MultiSelect
          label="Departments"
          options={formatOptions(departments, "id", "abv")}
          value={selectedOptions.department}
          onChange={handleSelectionChange("department")}
          placeholder="Department"
          isSearchable
          isDisabled={loading}
        />
      </div>
      <div className="col-md-4 mb-3">
        <MultiSelect
          label="Budget Code"
          options={formatOptions(codes, "id", "code")}
          value={selectedOptions.budget_code}
          onChange={handleSelectionChange("budget_code")}
          placeholder="Budget Code"
          isSearchable
          isDisabled={loading}
        />
      </div>
      <div className="col-md-9 mb-3">
        <TextInput
          label="Total Amount Approved"
          value={state.total_approved_amount}
          onChange={handleChange}
          placeholder="0"
          name="total_approved_amount"
        />
      </div>
      <div className="col-md-3 mb-3">
        <TextInput
          label="Period"
          value={state.budget_year}
          onChange={handleChange}
          name="budget_year"
          type="number"
        />
      </div>
      <div className="col-md-4 mb-3">
        <Select
          label="Budget Exhausted"
          name="is_exhausted"
          value={state.is_exhausted}
          onChange={handleChange}
          options={[
            { label: "Yes", value: 1 },
            { label: "No", value: 0 },
          ]}
          defaultValue={999}
          defaultCheckDisabled
          isDisabled={loading}
          valueKey="value"
          labelKey="label"
          size="sm"
        />
      </div>
      <div className="col-md-4 mb-3">
        <Select
          label="Logistics Budget"
          name="is_logistics"
          value={state.is_logistics}
          onChange={handleChange}
          options={[
            { label: "Yes", value: 1 },
            { label: "No", value: 0 },
          ]}
          defaultValue={999}
          defaultCheckDisabled
          isDisabled={loading}
          valueKey="value"
          labelKey="label"
          size="sm"
        />
      </div>
      <div className="col-md-4 mb-3">
        <Select
          label="Type"
          name="type"
          value={state.type}
          onChange={handleChange}
          options={[
            { label: "Capital", value: "capital" },
            { label: "Recurrent", value: "recurrent" },
            { label: "Personnel", value: "personnel" },
          ]}
          defaultValue={""}
          defaultCheckDisabled
          isDisabled={loading}
          valueKey="value"
          labelKey="label"
          size="sm"
        />
      </div>
    </>
  );
};

export default Fund;
