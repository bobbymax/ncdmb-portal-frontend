import React, { useMemo, useRef } from "react";
import { BlockContentComponentPorps } from ".";
import { BlockDataType } from "@/app/Repositories/Block/data";
import { ExpenseContentProps } from "app/Hooks/useBuilder";
import { useModal } from "app/Context/ModalContext";
import { ExpenseResponseData } from "@/app/Repositories/Expense/data";
import { formatCurrency } from "app/Support/Helpers";
import moment from "moment";
import ExpenseBlockModal from "../../modals/blocks/ExpenseBlockModal";
import { useTemplateBoard } from "app/Context/TemplateBoardContext";

// Manual edits are no longer needed since we're using global state directly

const ExpenseBlock: React.FC<BlockContentComponentPorps> = React.memo(
  ({ localContentState, updateLocal, sharedState, blockId }) => {
    const { openBlock, closeModal } = useModal();
    const identifier: BlockDataType = useMemo(() => "expense", []);

    const { state, actions } = useTemplateBoard();

    // Find the current block content from global state by content.id
    const currentBlock = state.contents.find(
      (content) => content.id === blockId
    );

    const currentContent = currentBlock?.content
      ?.expense as ExpenseContentProps;

    // Get expenses from global state
    const globalExpenses = currentContent?.expenses || [];
    const globalClaimState =
      currentContent?.claimState || sharedState?.claimState;

    const handleAddOrEditExpense = (
      data: unknown,
      mode?: "store" | "update"
    ) => {
      const expense = data as ExpenseResponseData;

      // Re-fetch current expenses to avoid race conditions
      const currentBlockRefreshed = state.contents.find(
        (content) => content.id === blockId
      );
      const currentExpenses =
        currentBlockRefreshed?.content?.expense?.expenses || [];

      if (mode === "update") {
        // Update global state directly
        const updatedExpenses = currentExpenses.map(
          (exp: ExpenseResponseData) => (exp.id === expense.id ? expense : exp)
        );

        if (currentBlockRefreshed) {
          actions.updateContent(
            currentBlockRefreshed.id,
            { expenses: updatedExpenses },
            identifier
          );
        } else {
          console.error("Could not find current block for expense update");
        }
      } else {
        // Generate a consistent ID for the new expense
        const newExpenseId = Date.now();

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

        const updatedExpenses = [...currentExpenses, newExpense];

        if (currentBlockRefreshed) {
          actions.updateContent(
            currentBlockRefreshed.id,
            { expenses: updatedExpenses },
            identifier
          );
        } else {
          console.error("Could not find current block for expense addition");
        }
      }

      closeModal();
    };

    // Function to open expense modal for editing
    const editExpense = (expense: ExpenseResponseData, index: number) => {
      openBlock(
        ExpenseBlockModal,
        {
          title: "Edit Expense",
          type: identifier,
          blockState: currentContent,
          data: expense,
          isUpdating: true,
          addBlockComponent: handleAddOrEditExpense,
          dependencies: {
            partials: [],
            extras: {
              claimState: globalClaimState,
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
          blockState: currentContent,
          data: null, // No existing data for new expense
          isUpdating: false,
          addBlockComponent: handleAddOrEditExpense,
          dependencies: {
            partials: [],
            extras: {
              claimState: globalClaimState,
            },
          },
        },
        identifier
      );
    };

    // Function to remove an expense
    const removeExpense = (index: number) => {
      // Re-fetch current expenses to avoid race conditions
      const currentBlockRefreshed = state.contents.find(
        (content) => content.id === blockId
      );
      const currentExpenses =
        currentBlockRefreshed?.content?.expense?.expenses || [];
      const expense = currentExpenses[index];

      if (expense && currentBlockRefreshed) {
        // Update global state directly
        const updatedExpenses = currentExpenses.filter(
          (exp: ExpenseResponseData) => exp.id !== expense.id
        );

        actions.updateContent(
          currentBlockRefreshed.id,
          { expenses: updatedExpenses },
          identifier
        );
      } else {
        console.error("Could not find expense or block for removal");
      }
    };

    return (
      <div className="expense__block__container">
        <div className="expense__block__header">
          <h5>Expense Management</h5>
          <button className="btn btn-primary btn-sm" onClick={addNewExpense}>
            <i className="ri-add-line"></i> Add Expense
          </button>
        </div>

        <div className="expense__block__content">
          {globalExpenses.length === 0 ? (
            <div className="expense__empty">
              <i className="ri-file-list-3-line"></i>
              <p>No expenses found. Add an expense to get started.</p>
            </div>
          ) : (
            <div className="expense__list">
              {globalExpenses.map((expense, index) => (
                <div key={expense.id || index} className="expense__card">
                  <div className="expense__card__header">
                    <div className="expense__card__title">
                      <h6>{expense.description || `Expense #${index + 1}`}</h6>
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

        {globalExpenses.length > 0 && (
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
                  globalExpenses.reduce(
                    (sum: number, exp: ExpenseResponseData) =>
                      sum + Number(exp.total_amount_spent),
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
