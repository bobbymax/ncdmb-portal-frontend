import { TransactionLinesProp } from "app/Hooks/useAccountingHooks";
import { formatAmountNoCurrency } from "app/Support/Helpers";
import React from "react";

const TransactionTrailBalanceTable = ({
  transactions,
  adjusted,
}: {
  transactions: TransactionLinesProp | undefined;
  adjusted?: boolean;
}) => {
  return (
    <div className="col-md-12 mb-3">
      <table className="table table-striped table-bordered">
        <thead>
          <tr>
            <th>Ledger</th>
            <th>Debit</th>
            <th>Credit</th>
          </tr>
        </thead>
        <tbody>
          {transactions?.gross && (
            <tr>
              <td>{transactions.gross.narration}</td>
              <td
                style={{
                  fontWeight: "bolder",
                  color: adjusted ? "red" : "black",
                }}
              >
                {`- ${formatAmountNoCurrency(
                  Number(transactions.gross.amount)
                )}`}
              </td>
              <td></td>
            </tr>
          )}
          {(transactions?.components ?? []).map((transaction, i) => (
            <tr key={i}>
              <td>{transaction.narration}</td>
              <td
                style={{
                  fontWeight: "bolder",
                  color: adjusted ? "red" : "black",
                }}
              >
                {`${
                  transaction.type === "debit"
                    ? `- ${formatAmountNoCurrency(Number(transaction.amount))}`
                    : ""
                }`}
              </td>
              <td
                style={{
                  fontWeight: "bolder",
                  color: adjusted ? "red" : "black",
                }}
              >{`${
                transaction.type === "credit"
                  ? formatAmountNoCurrency(Number(transaction.amount))
                  : ""
              }`}</td>
            </tr>
          ))}
          {transactions?.net && (
            <tr>
              <td>{transactions.net.narration}</td>
              <td></td>
              <td
                style={{
                  fontWeight: "bolder",
                  color: adjusted ? "red" : "black",
                }}
              >
                {formatAmountNoCurrency(Number(transactions.net.amount))}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTrailBalanceTable;
