import { useStateContext } from "app/Context/ContentContext";
import { ProcessedDataProps } from "app/Context/FileProcessorProvider";
import { ModalLoopProps, useModal } from "app/Context/ModalContext";
import { AllowanceResponseData } from "app/Repositories/Allowance/data";
import { ExpenseResponseData } from "app/Repositories/Expense/data";
import ExpenseRepository from "app/Repositories/Expense/ExpenseRepository";
import { RemunerationResponseData } from "app/Repositories/Remuneration/data";
import { formatCurrency, formatOptions } from "app/Support/Helpers";
import _ from "lodash";
import moment from "moment";
import React, { FormEvent, useEffect, useState } from "react";
import Button from "resources/views/components/forms/Button";
import { DataOptionsProps } from "resources/views/components/forms/MultiSelect";
import Select from "resources/views/components/forms/Select";
import Textarea from "resources/views/components/forms/Textarea";
import TextInput from "resources/views/components/forms/TextInput";

type DependencyProps = {
  allowances: AllowanceResponseData[];
  remunerations: RemunerationResponseData[];
};

const AlterExpense: React.FC<
  ModalLoopProps<ExpenseRepository, ExpenseResponseData>
> = ({
  modalState,
  data,
  isUpdating,
  dependencies,
  handleSubmit,
  repo,
  extras,
}) => {
  const {
    getModalState,
    updateModalState,
    handleInputChange,
    currentIdentifier,
  } = useModal();
  const { isLoading } = useStateContext();
  const state: ExpenseResponseData = getModalState(currentIdentifier);

  const [allowances, setAllowances] = useState<AllowanceResponseData[]>([]);
  const [children, setChildren] = useState<DataOptionsProps[]>([]);
  const [remunerations, setRemunerations] = useState<
    RemunerationResponseData[]
  >([]);
  const [period, setPeriod] = useState<{ value: string }[]>([]);
  const [hasDistanceCovered, setHasDistanceCovered] = useState<boolean>(false);
  const [stat, setStat] = useState<string>("");

  let status: "altered" | "cleared" | "rejected";
  let performed: "add" | "subtract" | "exact" | "removed";

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Determine status
    if (stat === "not-set") {
      const paid = Number(state.total_amount_paid);
      const spent = Number(state.total_amount_spent);

      if (paid === 0) {
        status = "rejected";
      } else if (paid === spent) {
        status = "cleared";
      } else {
        status = "altered";
      }
    } else {
      status = stat as "cleared" | "altered" | "rejected";
    }

    // Determine performed action
    const paid = Number(state.total_amount_paid);
    const spent = Number(state.total_amount_spent);

    if (status === "cleared") {
      performed = "exact";
    } else if (status === "rejected") {
      performed = "removed";
    } else {
      performed = paid > spent ? "add" : "subtract";
    }

    const props: ProcessedDataProps<ExpenseResponseData> = {
      raw: {
        ...state,
        status,
      },
      status,
      actionPerformed: performed,
    };

    handleSubmit(props);
  };

  const getAllowance = (id: number) => {
    return allowances.find((allowance) => allowance.id === id);
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
    if (state.unit_price > 0) {
      const start = moment(state.start_date);
      const end = moment(state.end_date);

      const days = end.diff(start, "days") + 1;

      updateModalState(currentIdentifier, {
        ...state,
        total_amount_paid: days * state.unit_price,
        no_of_days: days,
      });
    }
  }, [state.start_date, state.end_date, state.unit_price]);

  useEffect(() => {
    if (data) {
      const raw = data as ExpenseResponseData;
      updateModalState(currentIdentifier, raw);
    }
  }, [data]);

  useEffect(() => {
    if (dependencies) {
      const { allowances = [], remunerations = [] } =
        dependencies as DependencyProps;

      setAllowances(allowances);
      setRemunerations(remunerations);

      if (extras && _.isArray(extras) && extras.length > 0) {
        const period = extras[0];
        const status = extras.length > 1 ? extras[1] : "not-set";
        setStat(status);
        setPeriod(period);
      }
    }
  }, [dependencies, extras]);

  return (
    <form onSubmit={handleFormSubmit}>
      <div className="row">
        <div className="col-md-12 mb-5">
          <div className="flex column altered gap-sm">
            <small>{getAllowance(state.parent_id)?.name}</small>
            <p>{getAllowance(state.allowance_id)?.name}</p>
            <small>No. of Days: {state.no_of_days}</small>
            <small>
              Unit Price:{" "}
              {state.unit_price > 0
                ? formatCurrency(state.unit_price)
                : "Other"}
            </small>
            <small>Description: {state.description}</small>
          </div>
        </div>
        <div className="col-md-6 mb-3">
          <TextInput
            label="Start Date"
            type="date"
            name="start_date"
            value={state.start_date}
            onChange={handleInputChange}
            min={period[0]?.value ?? ""}
            isDisabled={isLoading || state.unit_price < 1}
          />
        </div>
        <div className="col-md-6 mb-3">
          <TextInput
            label="End Date"
            type="date"
            name="end_date"
            value={state.end_date}
            onChange={handleInputChange}
            min={state.start_date}
            isDisabled={isLoading || state.unit_price < 1}
          />
        </div>
        <div className={`col-md-${hasDistanceCovered ? 4 : 6} mb-3`}>
          <TextInput
            label="Total Amount Spent"
            name="total_amount_spent"
            value={state.total_amount_spent}
            onChange={handleInputChange}
            isDisabled={state.unit_price > 0}
            placeholder="Total Amount Spent"
          />
        </div>
        <div className={`col-md-${hasDistanceCovered ? 4 : 6} mb-3`}>
          <TextInput
            label="Total Amount Approved"
            name="total_amount_paid"
            value={state.total_amount_paid}
            onChange={handleInputChange}
            isDisabled
            placeholder="Enter Total Amount Approved"
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
            label="Remark"
            name="remark"
            value={state.remark}
            onChange={handleInputChange}
            placeholder="Remark"
            rows={2}
          />
        </div>
        <div className="col-md-12">
          <div className="flex align gap-sm">
            <Button
              label="Update Expense"
              icon="ri-file-edit-line"
              type="submit"
              variant="dark"
              size="sm"
            />
            {/* <Button
              label="Remove Expense"
              icon="ri-delete-row"
              variant="danger"
              size="sm"
              handleClick={() => {}}
            /> */}
          </div>
        </div>
      </div>
    </form>
  );
};

export default AlterExpense;
