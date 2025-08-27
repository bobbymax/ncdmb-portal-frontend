import React, { useMemo } from "react";
import { ContentBlock } from "@/resources/views/crud/DocumentTemplateBuilder";
import { ClaimResponseData } from "@/app/Repositories/Claim/data";
import { ExpenseResponseData } from "@/app/Repositories/Expense/data";
import moment from "moment";
import { formatCurrency } from "app/Support/Helpers";
import ExpenseContentCardModal from "../ContentCardModals/ExpenseContentCardModal";
import { useModal } from "app/Context/ModalContext";
import { usePaperBoard } from "app/Context/PaperBoardContext";
import { SheetProps } from "../../pages/DocumentTemplateContent";
import { BlockResponseData } from "@/app/Repositories/Block/data";

interface ExpenseContentCardProps {
  item: ContentBlock;
  onClose: () => void;
  isEditing: boolean;
  dependencies: unknown;
}

export type ExpenseContentProps = {
  claim: ClaimResponseData | null;
  expenses: ExpenseResponseData[] | null;
  dependencies: unknown;
};

const ExpenseContentCard: React.FC<ExpenseContentCardProps> = ({
  item,
  onClose,
  isEditing,
  dependencies: siblings,
}) => {
  const { openDeskComponent, closeModal } = useModal();
  const { state, actions } = usePaperBoard();
  const getDuration = (startDate: string, endDate: string) => {
    return (
      moment(startDate).format("ll") + " - " + moment(endDate).format("ll")
    );
  };

  const expenseContent = useMemo(() => {
    const contentBlock = state.body.find((body) => body.id === item.id);
    if (!contentBlock) return null;

    return {
      contentBlock,
      expense: contentBlock?.content?.expense as ExpenseContentProps,
    };
  }, [state.body, item]);

  const {
    claim = null,
    expenses = [],
    dependencies = null,
  } = expenseContent?.expense || {};

  const handleAddOrEditExpense = (
    props: unknown,
    mode?: "store" | "update"
  ) => {
    const expense = props as ExpenseResponseData;

    console.log("handleAddOrEditExpense called with mode:", mode);
    console.log("Expense data:", expense);
    console.log("Current expenses:", expenseContent?.expense?.expenses);

    if (mode === "store") {
      // Add new expense - append to existing expenses
      console.log("Adding new expense...");
      const newExpense: ContentBlock = {
        ...expenseContent?.contentBlock,
        id: crypto.randomUUID(),
        block: expenseContent?.contentBlock?.block as BlockResponseData,
        type: "expense",
        order: expenseContent?.contentBlock?.order || 0,
        content: {
          ...expenseContent?.contentBlock?.content,
          expense: {
            ...expenseContent?.expense,
            expenses: [
              ...(expenseContent?.expense?.expenses || []),
              expense, // Append new expense
            ],
          } as ExpenseContentProps,
        } as SheetProps,
      };

      console.log("New expense block:", newExpense);
      actions.updateBody(newExpense, "expense");
    } else {
      // Update existing expense - find and replace it
      console.log("Updating existing expense...");
      const updatedExpenses = (expenseContent?.expense?.expenses || []).map(
        (existingExpense) =>
          existingExpense.id === expense.id ? expense : existingExpense
      );

      console.log("Updated expenses array:", updatedExpenses);

      const updatedExpense: ContentBlock = {
        ...expenseContent?.contentBlock,
        id: expenseContent?.contentBlock?.id || crypto.randomUUID(),
        type: expenseContent?.contentBlock?.type || "expense",
        block: expenseContent?.contentBlock?.block as BlockResponseData,
        order: expenseContent?.contentBlock?.order || 0,
        content: {
          ...expenseContent?.contentBlock?.content,
          expense: {
            ...expenseContent?.expense,
            expenses: updatedExpenses, // Replace with updated array
          } as ExpenseContentProps,
        } as SheetProps,
      };

      console.log("Updated expense block:", updatedExpense);
      actions.updateBody(updatedExpense, "expense");
    }

    closeModal();
  };

  const handleDeleteExpense = (expenseId: string | number) => {
    const expenseToDelete = expenses?.find((exp) => exp.id === expenseId);

    if (!expenseToDelete) return;

    if (claim && expenses) {
      const updatedExpenses = expenses.filter((exp) => exp.id !== expenseId);

      const updatedClaim = {
        ...claim,
        expenses: updatedExpenses,
      };

      if (item.content?.expense) {
        const updatedContent = {
          ...item.content.expense,
          expenses: updatedExpenses,
          claim: updatedClaim,
        };

        const updatedItem: ContentBlock = {
          ...item,
          content: {
            ...item.content,
            expense: updatedContent,
          } as SheetProps,
        };

        const newBody = state.body.map((bodyItem) =>
          bodyItem.id === item.id ? updatedItem : bodyItem
        );

        actions.setBody(newBody);
      }
    }
  };

  if (isEditing) {
    return (
      <div className="expense__edit__container">
        <div className="expense__edit__header">
          <div className="expense__edit__header__text">
            <h6>Manage Expenses</h6>
            <p>Add, edit, or remove expense items</p>
          </div>
          <button
            className="expense__add__header__btn"
            onClick={() => {
              openDeskComponent(
                ExpenseContentCardModal,
                {
                  title: "Add New Expense",
                  type: "expense",
                  blockState: claim ?? null,
                  isUpdating: false,
                  data: null,
                  resolve: handleAddOrEditExpense,
                  dependencies,
                },
                "expense",
                null
              );
            }}
          >
            <i className="ri-add-line"></i>
            <span>Add Expense</span>
          </button>
        </div>

        <div className="expense__cards__grid">
          {expenses && Array.isArray(expenses) && expenses.length > 0 ? (
            expenses.map((expense) => (
              <div key={expense.id} className="expense__card">
                <div className="expense__card__header">
                  <div className="expense__card__title">
                    <i className="ri-money-dollar-circle-line"></i>
                    <span>{expense.description || "Expense Item"}</span>
                  </div>
                  <div className="expense__card__actions">
                    {Number(expense.unit_price) !==
                      Number(expense.total_amount_spent) && (
                      <button
                        className="expense__manage__btn"
                        title="Manage expense"
                        onClick={() => {
                          openDeskComponent(
                            ExpenseContentCardModal,
                            {
                              title: "Manage Expense",
                              type: "expense",
                              blockState: claim ?? null,
                              isUpdating: true,
                              data: expense,
                              resolve: handleAddOrEditExpense,
                              dependencies,
                            },
                            "expense",
                            expense
                          );
                        }}
                      >
                        <i className="ri-settings-4-line"></i>
                      </button>
                    )}

                    <button
                      className="expense__delete__btn"
                      title="Delete expense"
                      onClick={() => handleDeleteExpense(expense.id)}
                    >
                      <i className="ri-delete-bin-line"></i>
                    </button>
                  </div>
                </div>

                <div className="expense__card__content">
                  <div className="expense__detail__row">
                    <div className="expense__detail__label">
                      <i className="ri-calendar-line"></i>
                      <span>Duration:</span>
                    </div>
                    <div className="expense__detail__value">
                      {getDuration(expense.start_date, expense.end_date)}
                    </div>
                  </div>

                  <div className="expense__detail__row">
                    <div className="expense__detail__label">
                      <i className="ri-bank-card-line"></i>
                      <span>Amount:</span>
                    </div>
                    <div className="expense__detail__value expense__amount">
                      {formatCurrency(expense.total_amount_spent)}
                    </div>
                  </div>

                  {expense.type && (
                    <div className="expense__detail__row">
                      <div className="expense__detail__label">
                        <i className="ri-price-tag-3-line"></i>
                        <span>Type:</span>
                      </div>
                      <div className="expense__detail__value">
                        {expense.type}
                      </div>
                    </div>
                  )}

                  {expense.remark && (
                    <div className="expense__detail__row">
                      <div className="expense__detail__label">
                        <i className="ri-file-text-line"></i>
                        <span>Remark:</span>
                      </div>
                      <div className="expense__detail__value">
                        {expense.remark}
                      </div>
                    </div>
                  )}
                </div>

                <div className="expense__card__footer">
                  <div className="expense__status">
                    <span className="expense__status__badge">
                      {expense.status || "Active"}
                    </span>
                  </div>
                  <div className="expense__date">
                    <small>
                      Created:{" "}
                      {moment(expense.created_at || new Date()).format(
                        "MMM DD, YYYY"
                      )}
                    </small>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="expense__empty__state">
              <i className="ri-add-circle-line"></i>
              <span>No expenses added yet</span>
              <p>Click the button below to add your first expense</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="document__content__view">
      {!expenses || !Array.isArray(expenses) || expenses.length === 0 ? (
        <div className="document__content__empty">
          <i className="ri-file-damage-line"></i>
          <span>No expense has been entered</span>
        </div>
      ) : (
        <table className="document__content__table">
          <thead>
            <tr>
              <th>Duration</th>
              <th>Description</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense.id}>
                <td>{getDuration(expense.start_date, expense.end_date)}</td>
                <td>{expense.description}</td>
                <td
                  style={{
                    textAlign: "right",
                    fontWeight: 500,
                    textTransform: "uppercase",
                  }}
                >
                  {formatCurrency(expense.total_amount_spent)}
                </td>
              </tr>
            ))}
            <tr>
              <td
                colSpan={2}
                style={{
                  textAlign: "right",
                  fontWeight: "bolder",
                  textTransform: "uppercase",
                }}
              >
                Total Amount Spent:
              </td>
              <td
                style={{
                  textAlign: "right",
                  fontWeight: "bolder",
                  textTransform: "uppercase",
                  fontSize: "1.5rem",
                }}
              >
                {formatCurrency(
                  (expenses || []).reduce(
                    (acc, expense) =>
                      acc + (Number(expense.total_amount_spent) || 0),
                    0
                  )
                )}
              </td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ExpenseContentCard;
