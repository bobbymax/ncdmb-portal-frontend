/* eslint-disable react-hooks/exhaustive-deps */
import { useStateContext } from "app/Context/ContentContext";
import { ModalValueProps, useModal } from "app/Context/ModalContext";
import { useClaimComponents } from "app/Hooks/useClaimComponents";
import { AllowanceResponseData } from "app/Repositories/Allowance/data";
import { ExpenseResponseData } from "app/Repositories/Expense/data";
import { RemunerationResponseData } from "app/Repositories/Remuneration/data";
import { formatOptions, generateUniqueString } from "app/Support/Helpers";
import React, { FormEvent, useEffect, useState } from "react";
import Button from "resources/views/components/forms/Button";
import { DataOptionsProps } from "resources/views/components/forms/MultiSelect";
import Select from "resources/views/components/forms/Select";
import Textarea from "resources/views/components/forms/Textarea";
import TextInput from "resources/views/components/forms/TextInput";

const A_TYPES = {
  OTHER_STATES: "interstate-shuttle",
  YENAGOA_OTHER_STATES: "yenagoa-to-other-locations",
  OTHER_EXPENSES: "other-expenses",
};

const ExpenseModal: React.FC<ModalValueProps> = ({
  data,
  isUpdating,
  dependencies,
  onSubmit,
}) => {
  const { getModalState, updateModalState } = useModal();
  const { gradeLevelId, getNumOfDays } = useClaimComponents();
  const { isLoading } = useStateContext();
  const identifier = "expense";
  const state: ExpenseResponseData = getModalState(identifier);

  const [allowances, setAllowances] = useState<AllowanceResponseData[]>([]);
  const [children, setChildren] = useState<DataOptionsProps[]>([]);
  const [remunerations, setRemunerations] = useState<
    RemunerationResponseData[]
  >([]);
  const [hasDistanceCovered, setHasDistanceCovered] = useState<boolean>(false);
  const [period, setPeriod] = useState<{ value: string }[]>([]);

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    const response = isUpdating
      ? state
      : {
          ...state,
          identifier: generateUniqueString(32),
        };
    onSubmit(response, isUpdating ? "update" : "store");
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    updateModalState(identifier, { [name]: value });
  };

  useEffect(() => {
    if (state.parent_id > 0) {
      const children = allowances.filter(
        (allowance) => allowance.parent_id === Number(state.parent_id)
      );
      setChildren(formatOptions(children, "id", "name"));
    }
  }, [allowances, state.parent_id]);

  useEffect(() => {
    if (state.allowance_id > 0 && gradeLevelId > 0) {
      const allowance = allowances.find(
        (ale) => ale.id === Number(state.allowance_id)
      );

      if (allowance) {
        const remuneration = remunerations.find(
          (rem) =>
            rem.allowance_id === Number(state.allowance_id) &&
            rem.grade_level_id === Number(gradeLevelId)
        );

        if (remuneration) {
          let total_spent: number;
          if (allowance.days_required === 1) {
            total_spent = remuneration.amount * state.no_of_days;
          } else if (
            allowance.label === A_TYPES.OTHER_STATES ||
            allowance.label === A_TYPES.YENAGOA_OTHER_STATES
          ) {
            setHasDistanceCovered(true);
            total_spent = state.total_distance_covered * 150;
          } else if (allowance.label === A_TYPES.OTHER_EXPENSES) {
            total_spent = 0;
            setHasDistanceCovered(false);
          } else {
            total_spent = remuneration.amount;
            setHasDistanceCovered(false);
          }

          updateModalState(identifier, {
            ...state,
            remuneration_id: remuneration.id,
            unit_price: remuneration.amount,
            description: state.description ?? allowance.name,
            total_amount_spent: total_spent,
          });
        }
      }
    }

    return () => setHasDistanceCovered(false);
  }, [
    allowances,
    state.allowance_id,
    gradeLevelId,
    state.no_of_days,
    state.total_distance_covered,
  ]);

  useEffect(() => {
    if (state.start_date !== "" && state.end_date !== "") {
      const no_of_days = getNumOfDays(state.start_date, state.end_date);
      updateModalState(identifier, { no_of_days: Number(no_of_days) });
    } else {
      updateModalState(identifier, { no_of_days: 0 });
    }
  }, [state.start_date, state.end_date]);

  useEffect(() => {
    if (data) {
      const raw = data as ExpenseResponseData;
      updateModalState(identifier, raw);
    }
  }, [data]);

  useEffect(() => {
    if (dependencies) {
      const [allowances = [], remunerations = [], period = []] = dependencies;

      if (period.length > 0) setPeriod(period);
      setAllowances(allowances);
      setRemunerations(remunerations);
    }
  }, [dependencies]);

  return (
    <form onSubmit={handleFormSubmit}>
      <div className="row">
        <div className="col-md-6 mb-3">
          <Select
            label="Category"
            name="parent_id"
            value={state.parent_id}
            onChange={handleInputChange}
            options={allowances.filter(
              (allowance) =>
                allowance.category === "parent" && allowance.is_active === 1
            )}
            defaultValue={0}
            defaultCheckDisabled
            isDisabled={isLoading}
            valueKey="id"
            labelKey="name"
            size="xl"
          />
        </div>
        <div className="col-md-6 mb-3">
          <Select
            label="Allowance"
            name="allowance_id"
            value={state.allowance_id}
            onChange={handleInputChange}
            options={children}
            defaultValue={0}
            defaultCheckDisabled
            isDisabled={isLoading || state.parent_id === 0}
            valueKey="value"
            labelKey="label"
            size="xl"
          />
        </div>
        <div className="col-md-4 mb-3">
          <TextInput
            label="Start Date"
            type="date"
            name="start_date"
            value={state.start_date}
            onChange={handleInputChange}
            min={period[0]?.value ?? ""}
            isDisabled={isLoading}
          />
        </div>
        <div className="col-md-4 mb-3">
          <TextInput
            label="End Date"
            type="date"
            name="end_date"
            value={state.end_date}
            onChange={handleInputChange}
            min={state.start_date}
            isDisabled={isLoading}
          />
        </div>
        <div className="col-md-4 mb-3">
          <TextInput
            label="Number of Days"
            type="number"
            name="no_of_days"
            value={state.no_of_days}
            onChange={handleInputChange}
            isDisabled
          />
        </div>
        <div className={`col-md-${hasDistanceCovered ? 4 : 6} mb-3`}>
          <TextInput
            label="Unit Price"
            name="unit_price"
            value={state.unit_price}
            onChange={handleInputChange}
            isDisabled
            placeholder="Enter Unit Price"
          />
        </div>
        <div className={`col-md-${hasDistanceCovered ? 4 : 6} mb-3`}>
          <TextInput
            label="Total Amount Spent"
            name="total_amount_spent"
            value={state.total_amount_spent}
            onChange={handleInputChange}
            isDisabled={hasDistanceCovered}
            placeholder="Total Amount Spent"
          />
        </div>
        {hasDistanceCovered && (
          <div className="col-md-4 mb-3">
            <TextInput
              label="Total Distance Covered"
              name="total_distance_covered"
              value={state.total_distance_covered}
              onChange={handleInputChange}
              isDisabled={isLoading}
              placeholder="Total Distance Covered"
            />
          </div>
        )}
        <div className="col-md-12 mb-3">
          <Textarea
            label="Description"
            name="description"
            value={state.description}
            onChange={handleInputChange}
            isDisabled={isLoading}
            placeholder="Description"
            rows={5}
          />
        </div>
        <div className="col-md-12">
          <Button
            label="Add Expense"
            icon="ri-file-add-line"
            type="submit"
            variant="success"
          />
        </div>
      </div>
    </form>
  );
};

export default ExpenseModal;
