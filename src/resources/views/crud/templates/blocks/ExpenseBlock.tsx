import React, { useEffect, useMemo, useState, useRef } from "react";
import { BlockContentComponentPorps } from ".";
import { BlockDataType } from "@/app/Repositories/Block/data";
import { ExpenseContentProps } from "app/Hooks/useBuilder";
import { useModal } from "app/Context/ModalContext";
import useClaimCalculator from "app/Hooks/useClaimCalculator";
import { ClaimResponseData } from "@/app/Repositories/Claim/data";
import { ExpenseResponseData } from "@/app/Repositories/Expense/data";
import { repo } from "bootstrap/repositories";
import { expenseColumns } from "app/Repositories/Expense/columns";
import { formatCurrency } from "app/Support/Helpers";
import moment from "moment";
import ExpenseBlockModal from "../../modals/blocks/ExpenseBlockModal";

type ExpectedgeneratedData = {
  claimState: ClaimResponseData | null;
};

type ManualEditFunctions = {
  updateManualEdits: (
    expenseId: string,
    updatedExpense: ExpenseResponseData
  ) => void;
  removeManualEdit: (expenseId: string) => void;
  addManualExpense: (newExpense: ExpenseResponseData) => void;
  removeManualExpense: (expenseId: string) => void;
};

const ExpenseBlock: React.FC<BlockContentComponentPorps> = React.memo(
  ({ localContentState, updateLocal, sharedState }) => {
    const expenseRepo = useMemo(() => repo("expense"), []);
    const { openBlock, closeModal } = useModal();
    const identifier: BlockDataType = useMemo(() => "expense", []);

    // Use ref to access updateLocal without causing re-renders
    const updateLocalRef = useRef(updateLocal);
    updateLocalRef.current = updateLocal;

    // Use ref to track previous claimState to prevent unnecessary updates
    const prevClaimStateRef = useRef<ClaimResponseData | null>(null);

    const [state, setState] = useState<ExpenseContentProps>({
      expenses: [],
      loaded_type: "claim",
      claimState: null,
      headers: expenseColumns,
    });

    // Get manual edit functions from shared state
    const manualEditFunctions = sharedState?.claimState?.manualEditFunctions as
      | ManualEditFunctions
      | undefined;

    const handleAddOrEditExpense = (
      data: unknown,
      mode?: "store" | "update"
    ) => {
      const expense = data as ExpenseResponseData;

      if (mode === "update") {
        // Update the expense in manual edits
        if (manualEditFunctions) {
          const updatedExpense = {
            ...expense,
            description: `${expense.description} (Edited)`,
            total_amount_spent: expense.total_amount_spent * 1.1, // Simulate 10% increase
          };
          manualEditFunctions.updateManualEdits(
            expense.id.toString(),
            updatedExpense
          );
        }

        // Update local content state
        const currentLocalExpenses = localContentState?.expense?.expenses ?? [];
        const updatedLocalExpenses = currentLocalExpenses.map(
          (exp: ExpenseResponseData) => (exp.id === expense.id ? expense : exp)
        );

        const updatedLocalState = {
          ...localContentState,
          expense: {
            ...localContentState?.expense,
            expenses: updatedLocalExpenses,
          },
        };

        updateLocalRef.current(updatedLocalState, identifier);
      } else {
        // Generate a consistent ID for the new expense
        const newExpenseId = Date.now();

        // Add new expense to manual edits
        if (manualEditFunctions) {
          const newExpense: ExpenseResponseData = {
            id: newExpenseId,
            identifier: crypto.randomUUID(),
            parent_id: expense.parent_id,
            allowance_id: expense.allowance_id,
            remuneration_id: expense.remuneration_id,
            start_date: expense.start_date,
            end_date: expense.end_date,
            no_of_days: expense.no_of_days,
            total_distance_covered: expense.total_distance_covered,
            unit_price: expense.unit_price,
            total_amount_spent: expense.total_amount_spent,
            cleared_amount: expense.cleared_amount,
            audited_amount: expense.audited_amount,
            total_amount_paid: expense.total_amount_paid,
            variation: expense.variation,
            variation_type: expense.variation_type,
            description: expense.description,
          };

          manualEditFunctions.addManualExpense(newExpense);
        }

        // Update the shared state with the new expense
        if (sharedState?.claimState) {
          const currentExpenses = sharedState.claimState.expenses || [];

          const newExpense: ExpenseResponseData = {
            id: newExpenseId, // Use the same ID
            identifier: crypto.randomUUID(),
            parent_id: expense.parent_id,
            allowance_id: expense.allowance_id,
            remuneration_id: expense.remuneration_id,
            start_date: expense.start_date,
            end_date: expense.end_date,
            no_of_days: expense.no_of_days,
            total_distance_covered: expense.total_distance_covered,
            unit_price: expense.unit_price,
            total_amount_spent: expense.total_amount_spent,
            cleared_amount: expense.cleared_amount,
            audited_amount: expense.audited_amount,
            total_amount_paid: expense.total_amount_paid,
            variation: expense.variation,
            variation_type: expense.variation_type,
            description: expense.description,
          };

          const updatedExpenses = [...currentExpenses, newExpense];
          updateExpenses(updatedExpenses);
        }

        // Update local content state
        const currentLocalExpenses = localContentState?.expense?.expenses ?? [];
        const newExpense: ExpenseResponseData = {
          id: newExpenseId, // Use the same ID
          identifier: crypto.randomUUID(),
          parent_id: expense.parent_id,
          allowance_id: expense.allowance_id,
          remuneration_id: expense.remuneration_id,
          start_date: expense.start_date,
          end_date: expense.end_date,
          no_of_days: expense.no_of_days,
          total_distance_covered: expense.total_distance_covered,
          unit_price: expense.unit_price,
          total_amount_spent: expense.total_amount_spent,
          cleared_amount: expense.cleared_amount,
          audited_amount: expense.audited_amount,
          total_amount_paid: expense.total_amount_paid,
          variation: expense.variation,
          variation_type: expense.variation_type,
          description: expense.description,
        };

        const updatedLocalExpenses = [...currentLocalExpenses, newExpense];
        const updatedLocalState = {
          ...localContentState,
          expense: {
            ...localContentState?.expense,
            expenses: updatedLocalExpenses,
          },
        };

        updateLocalRef.current(updatedLocalState, identifier);
      }

      closeModal();
    };

    // Function to open expense modal for editing
    const editExpense = (expense: ExpenseResponseData, index: number) => {
      // TODO: Implement modal integration
      // console.log("Edit expense:", expense, "at index:", index);

      openBlock(
        ExpenseBlockModal,
        {
          title: "Edit Expense",
          type: identifier,
          blockState: state,
          data: expense,
          isUpdating: true,
          addBlockComponent: handleAddOrEditExpense,
          dependencies: {
            partials: [],
            extras: {
              claimState: sharedState?.claimState,
            },
          },
        },
        identifier
      );
    };

    // Function to open expense modal for adding new expense
    const addNewExpense = () => {
      openBlock(
        ExpenseBlockModal,
        {
          title: "Add New Expense",
          type: identifier,
          blockState: state,
          data: null, // No existing data for new expense
          isUpdating: false,
          addBlockComponent: handleAddOrEditExpense,
          dependencies: {
            partials: [],
            extras: {
              claimState: sharedState?.claimState,
            },
          },
        },
        identifier
      );
    };

    // Function to remove an expense
    const removeExpense = (index: number) => {
      const expense = state.expenses[index];
      if (expense && manualEditFunctions) {
        // Remove from manual edits
        manualEditFunctions.removeManualExpense(expense.id.toString());

        // Update the shared state
        if (sharedState?.claimState) {
          const currentExpenses = sharedState.claimState.expenses || [];
          const updatedExpenses = currentExpenses.filter(
            (exp: ExpenseResponseData) => exp.id !== expense.id
          );
          updateExpenses(updatedExpenses);
        }

        // Update local content state
        const currentLocalExpenses = localContentState?.expense?.expenses ?? [];
        const updatedLocalExpenses = currentLocalExpenses.filter(
          (exp: ExpenseResponseData) => exp.id !== expense.id
        );

        const updatedLocalState = {
          ...localContentState,
          expense: {
            ...localContentState?.expense,
            expenses: updatedLocalExpenses,
          },
        };

        updateLocalRef.current(updatedLocalState, identifier);
      }
    };

    // Function to update expenses and share changes
    const updateExpenses = (updatedExpenses: ExpenseResponseData[]) => {
      if (sharedState?.claimState) {
        const updatedClaimState = {
          ...sharedState.claimState,
          expenses: updatedExpenses,
        };

        const newState = {
          expenses: updatedExpenses,
          loaded_type: "claim" as const,
          claimState: updatedClaimState,
          headers: expenseColumns,
        };

        setState(newState);
        updateLocalRef.current(newState, identifier);

        // console.log("Expenses updated:", updatedExpenses);
      }
    };

    useEffect(() => {
      const currentClaimState = sharedState?.claimState;

      // Only update if claimState actually changed
      if (
        currentClaimState &&
        JSON.stringify(currentClaimState) !==
          JSON.stringify(prevClaimStateRef.current)
      ) {
        // Get the base expenses from claimState
        const baseExpenses = currentClaimState.expenses ?? [];

        // Get manual edits from claimState
        const manualEdits = currentClaimState.manualEdits ?? {};

        // Get local content state expenses (if any)
        const localExpenses = localContentState?.expense?.expenses ?? [];

        // console.log("ExpenseBlock merging:", {
        //   baseExpensesCount: baseExpenses.length,
        //   manualEditsCount: Object.keys(manualEdits).length,
        //   localExpensesCount: localExpenses.length,
        //   manualEdits: Object.keys(manualEdits),
        //   baseExpenseIds: baseExpenses.map(
        //     (exp: ExpenseResponseData) => exp.id
        //   ),
        //   localExpenseIds: localExpenses.map(
        //     (exp: ExpenseResponseData) => exp.id
        //   ),
        // });

        // Merge auto-generated expenses with manual edits
        const mergedExpenses = baseExpenses.map(
          (expense: ExpenseResponseData) => manualEdits[expense.id] || expense
        );

        // Add any manual expenses that aren't in the base list
        const manualOnlyExpenses = Object.values(manualEdits).filter(
          (manualExpense: any) =>
            !baseExpenses.find(
              (auto: ExpenseResponseData) => auto.id === manualExpense.id
            )
        ) as ExpenseResponseData[];

        // Add local content state expenses that aren't already included
        const localOnlyExpenses = localExpenses.filter(
          (localExpense: ExpenseResponseData) =>
            !baseExpenses.find(
              (auto: ExpenseResponseData) => auto.id === localExpense.id
            ) &&
            !Object.values(manualEdits).find(
              (manualExpense: any) => manualExpense.id === localExpense.id
            )
        );

        // Combine all sources: merged base expenses + manual only + local only
        const finalExpenses = [
          ...mergedExpenses,
          ...manualOnlyExpenses,
          ...localOnlyExpenses,
        ];

        // console.log("ExpenseBlock final expenses:", {
        //   mergedCount: mergedExpenses.length,
        //   manualOnlyCount: manualOnlyExpenses.length,
        //   localOnlyCount: localOnlyExpenses.length,
        //   finalCount: finalExpenses.length,
        //   finalExpenseIds: finalExpenses.map((exp) => exp.id),
        // });

        const newState = {
          expenses: finalExpenses,
          loaded_type: "claim" as const,
          claimState: currentClaimState,
          headers: expenseColumns,
        };

        setState(newState);
        updateLocalRef.current(newState, identifier);
        prevClaimStateRef.current = currentClaimState;
      }
    }, [sharedState?.claimState, localContentState, identifier]);

    return (
      <div className="expense__block__container">
        <div className="expense__block__header">
          <h5>Expense Management</h5>
          <button className="btn btn-primary btn-sm" onClick={addNewExpense}>
            <i className="ri-add-line"></i> Add Expense
          </button>
        </div>

        <div className="expense__block__content">
          {state.expenses.length === 0 ? (
            <div className="expense__empty">
              <i className="ri-file-list-3-line"></i>
              <p>No expenses found. Add an expense to get started.</p>
            </div>
          ) : (
            <div className="expense__list">
              {state.expenses.map((expense, index) => (
                <div key={expense.id || index} className="expense__card">
                  <div className="expense__card__header">
                    <div className="expense__card__title">
                      <h6>
                        {expense.description || `Expense #${index + 1}`}
                        {sharedState?.claimState?.manualEditFunctions &&
                          sharedState?.claimState?.manualEdits?.[
                            expense.id
                          ] && (
                            <span
                              className="expense__manual__badge"
                              title="Manually Edited"
                            >
                              <i className="ri-edit-line"></i>
                            </span>
                          )}
                      </h6>
                      <span className="expense__card__amount">
                        {formatCurrency(expense.total_amount_spent)}
                      </span>
                    </div>
                    <div className="expense__card__actions">
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => editExpense(expense, index)}
                        title="Edit Expense"
                      >
                        <i className="ri-settings-3-line"></i>
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => removeExpense(index)}
                        title="Remove Expense"
                      >
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    </div>
                  </div>

                  <div className="expense__card__details">
                    <div className="expense__detail__row">
                      <div className="expense__detail__item">
                        <i className="ri-calendar-line"></i>
                        <span>
                          {moment(expense.start_date).format("MMM DD")} -{" "}
                          {moment(expense.end_date).format("MMM DD")}
                        </span>
                      </div>
                      <div className="expense__detail__item">
                        <i className="ri-time-line"></i>
                        <span>
                          {expense.no_of_days} day
                          {expense.no_of_days !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>

                    <div className="expense__detail__row">
                      <div className="expense__detail__item">
                        <i className="ri-money-dollar-circle-line"></i>
                        <span>Unit: {formatCurrency(expense.unit_price)}</span>
                      </div>
                      {expense.total_distance_covered > 0 && (
                        <div className="expense__detail__item">
                          <i className="ri-road-map-line"></i>
                          <span>{expense.total_distance_covered} km</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {state.expenses.length > 0 && (
          <div className="expense__block__footer">
            <div className="expense__total">
              <small
                style={{
                  fontSize: 21,
                  display: "block",
                  textAlign: "right",
                  fontWeight: 500,
                }}
              >
                Total:{" "}
                {formatCurrency(
                  state.expenses.reduce(
                    (sum, exp) => sum + Number(exp.total_amount_spent),
                    0
                  )
                )}
              </small>
            </div>
          </div>
        )}
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison: only re-render if claimState data actually changed
    const prevClaimState = prevProps.sharedState?.claimState;
    const nextClaimState = nextProps.sharedState?.claimState;

    // If both are null/undefined, no change
    if (!prevClaimState && !nextClaimState) return true;

    // If one is null/undefined and the other isn't, there's a change
    if (!prevClaimState || !nextClaimState) return false;

    // Compare the actual data, not the object reference
    return JSON.stringify(prevClaimState) === JSON.stringify(nextClaimState);
  }
);

export default ExpenseBlock;
