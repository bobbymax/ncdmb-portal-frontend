import useClaimCalculator from "app/Hooks/useClaimCalculator";
import { ExpenseResponseData } from "@/app/Repositories/Expense/data";
import { DeskComponentModalProps, useModal } from "app/Context/ModalContext";
import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { useAuth } from "app/Context/AuthContext";
import { formatOptions, generateUniqueString } from "app/Support/Helpers";
import Select from "../forms/Select";
import TextInput from "../forms/TextInput";
import Textarea from "../forms/Textarea";
import Button from "../forms/Button";

type ExpenseContentCardDependencies = {
  partials: any[];
  extras: any;
};

const ExpenseContentCardModal: React.FC<DeskComponentModalProps<"expense">> = ({
  title,
  type,
  blockState,
  data,
  isUpdating,
  resolve,
  dependencies,
}) => {
  const { staff } = useAuth();
  const { getModalState, updateModalState } = useModal();
  const {
    allowances = [],
    cities = [],
    countWeekdays,
    getNumOfDays,
    formDescription,
  } = useClaimCalculator();
  const state: ExpenseResponseData = getModalState(type);
  const remunerations = useMemo(() => staff?.remunerations ?? [], [staff]);
  const [hasDistanceCovered, setHasDistanceCovered] = useState<boolean>(false);

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    const response = isUpdating
      ? state
      : {
          ...state,
          id: crypto.randomUUID(),
        };

    resolve(response, isUpdating ? "update" : "store");
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    updateModalState(type, { [name]: value });
  };

  useEffect(() => {
    if (state.allowance_id > 0 && staff && staff.grade_level_id > 0) {
      const allowance = allowances.find(
        (ale) => ale.id === Number(state.allowance_id)
      );

      if (allowance) {
        const remuneration = remunerations.find(
          (rem) =>
            rem.allowance_id === Number(state.allowance_id) &&
            rem.grade_level_id === Number(staff.grade_level_id)
        );

        if (remuneration) {
          let total_spent: number;
          const amount = Number(remuneration.amount);
          if (allowance.payment_basis === "km") {
            setHasDistanceCovered(true);
            total_spent = state.total_distance_covered * 150;
          } else if (
            allowance.payment_basis === "days" ||
            allowance.payment_basis === "nights"
          ) {
            total_spent = amount * state.no_of_days;
          } else if (allowance.payment_basis === "weekdays") {
            total_spent =
              amount * countWeekdays(state.start_date, state.end_date);
          } else {
            total_spent = amount;
          }

          updateModalState(type, {
            ...state,
            remuneration_id: remuneration.id,
            unit_price: amount,
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
    staff,
    state.no_of_days,
    state.total_distance_covered,
  ]);

  useEffect(() => {
    if (state.start_date !== "" && state.end_date !== "") {
      const no_of_days = getNumOfDays(state.start_date, state.end_date);
      updateModalState(type, { no_of_days: Number(no_of_days) });
    } else {
      updateModalState(type, { no_of_days: 0 });
    }
  }, [state.start_date, state.end_date]);

  useEffect(() => {
    if (data) {
      updateModalState(type, data as ExpenseResponseData);
    }
  }, [data]);

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
            isDisabled={false}
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
            options={formatOptions(
              allowances.filter(
                (allowance) =>
                  Number(allowance.parent_id) === Number(state.parent_id)
              ),
              "id",
              "name"
            )}
            defaultValue={0}
            defaultCheckDisabled
            isDisabled={state.parent_id === 0}
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
            isDisabled={false}
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
            isDisabled={false}
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
              isDisabled={false}
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
            isDisabled={false}
            placeholder="Description"
            rows={5}
          />
        </div>
        <div className="col-md-12">
          <Button
            label={isUpdating ? "Update Expense" : "Add Expense"}
            icon={isUpdating ? "ri-file-edit-line" : "ri-file-add-line"}
            type="submit"
            variant={isUpdating ? "dark" : "success"}
          />
        </div>
      </div>
    </form>
  );
};

export default ExpenseContentCardModal;
