import React from "react";
import { ColumnData } from "../tables/CustomDataTable";
import { BaseResponse } from "app/Repositories/BaseRepository";
import { ExpenseResponseData } from "app/Repositories/Expense/data";
import {
  formatAmountNoCurrency,
  formatDateToPeriodString,
} from "app/Support/Helpers";

interface TableProps {
  expenses: ExpenseResponseData[];
  manage?: (raw: ExpenseResponseData) => void;
}

const PageTable = ({ expenses }: TableProps) => {
  return (
    <div className="print__expense__wrapper mt-4">
      <div className="table__wrapper">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Duration</th>
              <th
                style={{
                  textAlign: "right",
                }}
              >
                Amount Spent
              </th>
            </tr>
          </thead>
          <tbody>
            {(expenses ?? []).map((expense) => (
              <tr key={expense.id}>
                <td>{expense.description}</td>
                <td>
                  {formatDateToPeriodString(
                    expense.start_date,
                    expense.end_date
                  )}
                </td>
                <td className="amount">
                  {formatAmountNoCurrency(expense.total_amount_spent)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PageTable;
