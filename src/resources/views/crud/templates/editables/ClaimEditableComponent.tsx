import {
  EditableComponentProps,
  ProcessedDataProps,
  useFileProcessor,
} from "app/Context/FileProcessorProvider";
import { useModal } from "app/Context/ModalContext";
import useResource from "app/Hooks/useResource";
import { ClaimResponseData } from "app/Repositories/Claim/data";
import {
  formatCurrency,
  formatDateToPeriodString,
  getEarliestAndLatestDates,
} from "app/Support/Helpers";
import { repo } from "bootstrap/repositories";
import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Button from "resources/views/components/forms/Button";
import pending from "../../../../assets/images/pending.png";
import altered from "../../../../assets/images/updated.png";
import cleared from "../../../../assets/images/cleared.png";
import rejected from "../../../../assets/images/rejected.png";
import AlterExpense from "../../modals/AlterExpense";
import { ExpenseResponseData } from "app/Repositories/Expense/data";
import { BaseResponse } from "app/Repositories/BaseRepository";
import Box from "resources/views/components/forms/Box";
import Alert from "app/Support/Alert";

const ClaimEditableComponent: React.FC<
  EditableComponentProps<ClaimResponseData>
> = ({ file, resource: claim, action }) => {
  const expenseRepo = useMemo(() => repo("expense"), []);
  const { openLoop, setSize, closeModal } = useModal();
  const {
    processIncomingData,
    processedData,
    resetEditableState,
    resolveProcessedData,
    reconcile,
  } = useFileProcessor();
  const { dependencies } = useResource(expenseRepo, claim.expenses);
  const [period, setPeriod] = useState<{ value: string }[]>([]);
  const [bulk, setBulk] = useState<number[]>([]);
  const [allSelected, setAllSelected] = useState<"yes" | "no">("no");

  const statusBadge = {
    pending: {
      className: "warning",
      icon: "ri-hourglass-line",
      color: "orange",
    },
    cleared: {
      className: "success",
      icon: "ri-verified-badge-fill",
      color: "green",
    },
    altered: {
      className: "secondary",
      icon: "ri-loop-right-line",
      color: "purple",
    },
    rejected: {
      className: "danger",
      icon: "ri-close-circle-fill",
      color: "red",
    },
  };

  const handle = <T extends BaseResponse>(props: ProcessedDataProps<T>) => {
    processIncomingData(props);
    closeModal();
  };

  const liveExpenses = useMemo(() => {
    if (!claim || !claim.expenses) return [];

    const updatedExpenses = claim.expenses.map((expense) => {
      // Check if this expense exists in processedData
      const updated = processedData.find((p) => {
        const rawExpense = p.raw as ExpenseResponseData;

        return (
          rawExpense.id === expense.id &&
          rawExpense.allowance === expense.allowance
        );
      });

      if (updated) {
        return {
          ...expense,
          ...updated.raw, // updated fields take priority
        };
      }

      return expense; // no updates, keep original
    });

    return updatedExpenses;
  }, [claim.expenses, processedData]);

  const groupByAllowance = useMemo(() => {
    if (!liveExpenses) return {};

    return liveExpenses.reduce<Record<string, typeof liveExpenses>>(
      (acc, item) => {
        const key = item.allowance ?? "Unknown";
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(item);
        return acc;
      },
      {}
    );
  }, [liveExpenses]);

  const handleSelectAll = (e: ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setAllSelected(isChecked ? "yes" : "no");

    const pending: number[] =
      liveExpenses
        .filter((exp) => exp.status === "pending")
        .map((exp) => Number(exp.id)) ?? [];

    setBulk(isChecked ? pending : []);
  };

  const clearPendingExpenses = useCallback(() => {
    const bulkSet = new Set(bulk);
    const matchExpenses = liveExpenses.filter((exp) => bulkSet.has(exp.id));
    if (matchExpenses.length === 0) return;

    Alert.flash("Confirm!", "info", "Clear all expenses for this claim?").then(
      async (result) => {
        if (result.isConfirmed) {
          for (const exp of matchExpenses) {
            const newValue: ProcessedDataProps<ExpenseResponseData> = {
              raw: {
                ...exp,
                status: "cleared",
                total_amount_paid: exp.total_amount_spent,
              },
              status: "cleared",
              actionPerformed: "exact",
            };

            processIncomingData(newValue);

            await new Promise((resolve) => setTimeout(resolve, 400));
          }

          setBulk([]);
          setAllSelected("no");
          closeModal();
        }
      }
    );
  }, [bulk, liveExpenses]);

  // console.log(bulk);

  const handleCheckbox = (isChecked: boolean, expense: ExpenseResponseData) => {
    if (isChecked && !bulk.includes(expense.id)) {
      setBulk((prev) => [...prev, expense.id]);
    } else {
      setBulk((prev) => prev.filter((item) => item !== expense.id));
    }
  };

  useEffect(() => {
    if (liveExpenses && liveExpenses.length > 0) {
      const { earliest } = getEarliestAndLatestDates(
        liveExpenses.map((expense) => expense.start_date)
      );
      const { latest } = getEarliestAndLatestDates(
        liveExpenses.map((expense) => expense.end_date)
      );

      const duration: { value: string }[] = [
        { value: earliest },
        { value: latest },
      ];
      setPeriod(duration);
      setSize("md");
    }
  }, [liveExpenses]);

  useEffect(() => {
    if (liveExpenses.length > 0 && bulk.length > 0) {
      const idSet = new Set(bulk);
      const matchingObjects = liveExpenses.filter((exp) => idSet.has(exp.id));

      const pending = liveExpenses.filter(
        (exp) => exp.status === "pending"
      ).length;

      setAllSelected(matchingObjects.length === pending ? "yes" : "no");
    }
  }, [liveExpenses, bulk]);

  return (
    <div className="row">
      <div className="col-md-12 mt-4">
        <div className="expense__items__card">
          <div className="checker flex align gap-xl mb-4">
            <Box
              label="Select All"
              value={allSelected}
              onChange={handleSelectAll}
              isChecked={
                allSelected === "yes" ||
                (bulk.length > 0 &&
                  bulk.length ===
                    liveExpenses.filter((exp) => exp.status === "pending")
                      .length)
              }
              isDisabled={
                liveExpenses.filter((exp) => exp.status === "pending").length <
                1
              }
            />
            <Button
              label="Clear Expenses"
              variant="success"
              handleClick={() => clearPendingExpenses()}
              size="sm"
              icon="ri-verified-badge-line"
              isDisabled={bulk.length < 1}
            />
          </div>
          {Object.entries(groupByAllowance).map(([allowanceName, expenses]) => (
            <div className="exp__card__item mb-4" key={allowanceName}>
              <div className="flex align between">
                <h3>{allowanceName}</h3>
                <div className="flex align gap-md">
                  <h3>
                    NGN{" "}
                    {expenses
                      .reduce(
                        (sum, exp) => sum + Number(exp.total_amount_spent),
                        0
                      )
                      .toLocaleString()}
                  </h3>
                  /
                  <h3>
                    NGN{" "}
                    {expenses
                      .reduce(
                        (sum, exp) => sum + Number(exp.total_amount_paid),
                        0
                      )
                      .toLocaleString()}
                  </h3>
                </div>
              </div>

              <table className="table table-bordered table-responsive table-striped editable__table mt-3">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Spent</th>
                    <th>Approved</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="list__styling">
                      <td className="exp__details__item flex align gap-md">
                        <Box
                          value={expense.id}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            handleCheckbox(isChecked, expense);
                          }}
                          isChecked={bulk.includes(expense.id)}
                          isDisabled={expense.status !== "pending"}
                        />
                        <Button
                          icon={action?.icon}
                          variant={action?.variant}
                          handleClick={() =>
                            openLoop(AlterExpense, "expense", {
                              title: "Modify Claim Expense",
                              modalState: expenseRepo.getState(),
                              data: expense,
                              repo: expenseRepo,
                              isUpdating: true,
                              handleSubmit: handle,
                              dependencies,
                              extras: period,
                            })
                          }
                          size="sm"
                        />
                        <div>
                          <small>
                            {formatDateToPeriodString(
                              expense.start_date,
                              expense.end_date
                            )}
                          </small>
                          <p>{expense.description}</p>
                        </div>
                      </td>
                      <td className="exp__card__list__item">
                        <h5>{formatCurrency(expense.total_amount_spent)}</h5>
                      </td>
                      <td>
                        <h5>{formatCurrency(expense.total_amount_paid)}</h5>
                      </td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                          className={`modifyable__badge ${
                            statusBadge[expense?.status ?? "pending"].className
                          }`}
                        >
                          <i
                            className={`${
                              statusBadge[expense?.status ?? "pending"].icon
                            }`}
                            style={{
                              color:
                                statusBadge[expense?.status ?? "pending"].color,
                              fontSize: 14,
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

          {reconcile && (
            <div className="col-md-12 mt-5 mb-3">
              <Button
                label={reconcile?.button_text}
                isDisabled={processedData.length < 1}
                handleClick={resolveProcessedData}
                icon={reconcile.icon}
                size="sm"
                variant="success"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClaimEditableComponent;
