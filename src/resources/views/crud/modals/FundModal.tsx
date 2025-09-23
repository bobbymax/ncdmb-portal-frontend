import { useStateContext } from "app/Context/ContentContext";
import { ModalValueProps, useModal } from "app/Context/ModalContext";
import { BudgetCodeResponseData } from "app/Repositories/BudgetCode/data";
import { DepartmentResponseData } from "app/Repositories/Department/data";
import { FundResponseData } from "app/Repositories/Fund/data";
import { SubBudgetHeadResponseData } from "app/Repositories/SubBudgetHead/data";
import Alert from "app/Support/Alert";
import { formatOptions } from "app/Support/Helpers";
import { repo } from "bootstrap/repositories";
import React, { FormEvent, useCallback, useEffect, useState } from "react";
import { ActionMeta } from "react-select";
import Button from "resources/views/components/forms/Button";
import MultiSelect, {
  DataOptionsProps,
} from "resources/views/components/forms/MultiSelect";
import Select from "resources/views/components/forms/Select";
import TextInput from "resources/views/components/forms/TextInput";

type DependencyProps = {
  budgetCodes: BudgetCodeResponseData[];
  departments: DepartmentResponseData[];
};

const FundModal: React.FC<ModalValueProps> = ({
  data,
  isUpdating,
  dependencies,
  onSubmit,
}) => {
  const fundRepo = repo("fund");
  const { getModalState, updateModalState } = useModal();
  const { isLoading } = useStateContext();
  const identifier = "tracker";
  const state: FundResponseData = getModalState(identifier);

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

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();

    Alert.flash(
      "Credit Budget Head",
      "info",
      "You are about to credit this budget head"
    ).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fundRepo.store("funds", state);

          if (response.code === 201) {
            onSubmit(state, "store");
          }
        } catch (error) {
          // Error saving this Fund
        }
      }
    });
  };

  const fetchDependencies = async () => {
    const response = await fundRepo.dependencies();
    const { budgetCodes = [], departments = [] } = response;

    setCodes(budgetCodes);
    setDepartments(departments);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    updateModalState(identifier, { [name]: value });
  };

  const handleSelectionChange = useCallback(
    (key: keyof typeof selectedOptions) =>
      (newValue: unknown, actionMeta: ActionMeta<unknown>) => {
        const updatedValue = Array.isArray(newValue)
          ? (newValue as DataOptionsProps[])
          : (newValue as DataOptionsProps);

        // Update modal state dynamically
        updateModalState(
          identifier,
          Array.isArray(updatedValue)
            ? { [key]: updatedValue }
            : { [`${key}_id`]: updatedValue.value }
        );

        setSelectedOptions((prev) => ({ ...prev, [key]: updatedValue }));
      },
    [updateModalState, identifier]
  );

  useEffect(() => {
    if (data) {
      const subBudgetHead = data as SubBudgetHeadResponseData;
      fetchDependencies();
      setSelectedOptions((prev) => ({
        ...prev,
        sub_budget_head: { label: subBudgetHead.name, value: subBudgetHead.id },
      }));
      updateModalState(identifier, {
        ...state,
        sub_budget_head_id: subBudgetHead.id,
      });
    }
  }, [data]);

  return (
    <form onSubmit={handleFormSubmit}>
      <div className="row">
        <div className="col-md-6 mb-3">
          <MultiSelect
            label="Departments"
            options={formatOptions(departments, "id", "abv")}
            value={selectedOptions.department}
            onChange={handleSelectionChange("department")}
            placeholder="Department"
            isSearchable
            isDisabled={isLoading}
          />
        </div>
        <div className="col-md-6 mb-3">
          <MultiSelect
            label="Budget Code"
            options={formatOptions(codes, "id", "code")}
            value={selectedOptions.budget_code}
            onChange={handleSelectionChange("budget_code")}
            placeholder="Budget Code"
            isSearchable
            isDisabled={isLoading}
          />
        </div>
        <div className="col-md-9 mb-3">
          <TextInput
            label="Total Amount Approved"
            value={state.total_approved_amount}
            onChange={handleInputChange}
            placeholder="0"
            name="total_approved_amount"
          />
        </div>
        <div className="col-md-3 mb-3">
          <TextInput
            label="Period"
            value={state.budget_year}
            onChange={handleInputChange}
            name="budget_year"
            type="number"
          />
        </div>
        <div className="col-md-4 mb-3">
          <Select
            label="Budget Exhausted"
            name="is_exhausted"
            value={state.is_exhausted}
            onChange={handleInputChange}
            options={[
              { label: "Yes", value: 1 },
              { label: "No", value: 0 },
            ]}
            defaultValue={999}
            defaultCheckDisabled
            isDisabled={isLoading}
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
            onChange={handleInputChange}
            options={[
              { label: "Yes", value: 1 },
              { label: "No", value: 0 },
            ]}
            defaultValue={999}
            defaultCheckDisabled
            isDisabled={isLoading}
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
            onChange={handleInputChange}
            options={[
              { label: "Capital", value: "capital" },
              { label: "Recurrent", value: "recurrent" },
              { label: "Personnel", value: "personnel" },
            ]}
            defaultValue={""}
            defaultCheckDisabled
            isDisabled={isLoading}
            valueKey="value"
            labelKey="label"
            size="sm"
          />
        </div>
        <div className="col-md-12 mb-3">
          <Button
            label="Credit Budget Head"
            type="submit"
            icon="ri-secure-payment-line"
            isDisabled={
              isLoading ||
              state.department_id < 1 ||
              state.budget_code_id < 1 ||
              state.total_approved_amount === "" ||
              state.budget_year < 2024
            }
            size="sm"
            variant="success"
            iconSize="lg"
          />
        </div>
      </div>
    </form>
  );
};

export default FundModal;
