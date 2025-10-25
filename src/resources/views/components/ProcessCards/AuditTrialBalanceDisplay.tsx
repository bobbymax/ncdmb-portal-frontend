import React from "react";
import { TransactionResponseData } from "@/app/Repositories/Transaction/data";
import { PaymentResponseData } from "@/app/Repositories/Payment/data";

interface AuditTrialBalanceDisplayProps {
  transactions: TransactionResponseData[];
  payment: PaymentResponseData;
}

/**
 * Audit Trial Balance Display Component
 * Displays trial balance for saved transactions from database
 */
export const AuditTrialBalanceDisplay: React.FC<
  AuditTrialBalanceDisplayProps
> = ({ transactions, payment }) => {
  console.log("AuditTrialBalance - Raw transactions:", transactions);
  console.log("AuditTrialBalance - Payment:", payment);

  // Separate transactions by type
  const debitTransactions = transactions.filter((t) => t.type === "debit");
  const creditTransactions = transactions.filter((t) => t.type === "credit");

  console.log("AuditTrialBalance - Debit transactions:", debitTransactions);
  console.log("AuditTrialBalance - Credit transactions:", creditTransactions);

  // Calculate totals
  const totalDebits = debitTransactions.reduce(
    (sum, t) => sum + Number(t.debit_amount || 0),
    0
  );
  const totalCredits = creditTransactions.reduce(
    (sum, t) => sum + Number(t.credit_amount || 0),
    0
  );

  console.log("AuditTrialBalance - Total Debits:", totalDebits);
  console.log("AuditTrialBalance - Total Credits:", totalCredits);

  const variance = Math.abs(totalDebits - totalCredits);
  const isBalanced = variance < 0.01;

  // Format currency
  const formatCurrency = (
    amount: string | number,
    currency: string = "NGN"
  ): string => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(numAmount);
  };

  // Find max length for table rows
  const maxRows = Math.max(debitTransactions.length, creditTransactions.length);

  return (
    <div className="trial-balance-container mb-4">
      {/* Header */}
      <div className="trial-balance-header">
        <span className="trial-balance-title">Transaction Preview</span>
        <span
          className={`trial-balance-status ${
            isBalanced ? "balanced" : "imbalanced"
          }`}
        >
          <i
            className={`ri-${
              isBalanced ? "checkbox-circle-line" : "error-warning-line"
            }`}
          ></i>{" "}
          {isBalanced ? "Balanced" : "Imbalanced"}
        </span>
      </div>

      {/* Trial Balance Table */}
      <table className="trial-balance-table">
        <thead>
          <tr>
            <th className="text-left">Debit</th>
            <th className="text-right">Amount</th>
            <th className="text-left">Credit</th>
            <th className="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {/* Render rows side by side */}
          {Array.from({ length: maxRows }).map((_, idx) => {
            const debitTrans = debitTransactions[idx];
            const creditTrans = creditTransactions[idx];

            return (
              <tr key={idx}>
                {/* Debit Account */}
                <td>
                  {debitTrans ? (
                    <div>
                      <div className="trial-balance-account-name">
                        {debitTrans.journal_type?.code || "N/A"}
                      </div>
                      <div className="trial-balance-account-desc">
                        {debitTrans.journal_type?.name || debitTrans.narration}
                      </div>
                    </div>
                  ) : (
                    <span className="trial-balance-empty-cell">-</span>
                  )}
                </td>
                {/* Debit Amount */}
                <td className="text-right">
                  {debitTrans
                    ? formatCurrency(
                        debitTrans.debit_amount || 0,
                        payment.currency
                      )
                    : "-"}
                </td>
                {/* Credit Account */}
                <td>
                  {creditTrans ? (
                    <div>
                      <div className="trial-balance-account-name">
                        {creditTrans.journal_type?.code || "N/A"}
                      </div>
                      <div className="trial-balance-account-desc">
                        {creditTrans.journal_type?.name ||
                          creditTrans.narration}
                      </div>
                    </div>
                  ) : (
                    <span className="trial-balance-empty-cell">-</span>
                  )}
                </td>
                {/* Credit Amount */}
                <td className="text-right">
                  {creditTrans
                    ? formatCurrency(
                        creditTrans.credit_amount || 0,
                        payment.currency
                      )
                    : "-"}
                </td>
              </tr>
            );
          })}

          {/* Totals Row */}
          <tr className="totals-row">
            <td>Total</td>
            <td className="text-right">
              {formatCurrency(totalDebits, payment.currency)}
            </td>
            <td>Total</td>
            <td className="text-right">
              {formatCurrency(totalCredits, payment.currency)}
            </td>
          </tr>

          {/* Balance Status Row */}
          {!isBalanced && (
            <tr className="imbalance-row">
              <td colSpan={4}>
                <i className="ri-error-warning-line"></i> Imbalance:{" "}
                {formatCurrency(variance, payment.currency)}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AuditTrialBalanceDisplay;
