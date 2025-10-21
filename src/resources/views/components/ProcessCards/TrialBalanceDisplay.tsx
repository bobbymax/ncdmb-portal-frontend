import React from "react";
import { TransactionResponseData } from "@/app/Repositories/Transaction/data";
import { PaymentResponseData } from "@/app/Repositories/Payment/data";
import { useTrialBalance } from "app/Hooks/useTrialBalance";

interface TrialBalanceDisplayProps {
  transactions: Partial<TransactionResponseData>[];
  payment: PaymentResponseData;
}

/**
 * Trial Balance Display Component
 * Displays a side-by-side trial balance preview with debits and credits
 */
export const TrialBalanceDisplay: React.FC<TrialBalanceDisplayProps> = ({
  transactions,
  payment,
}) => {
  // Use trial balance hook for calculations
  const {
    leftTransactions,
    rightTransactions,
    leftTotal,
    rightTotal,
    isBalanced,
    variance,
  } = useTrialBalance(transactions);

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
          {Array.from({
            length: Math.max(leftTransactions.length, rightTransactions.length),
          }).map((_, idx) => {
            const leftTrans = leftTransactions[idx];
            const rightTrans = rightTransactions[idx];

            return (
              <tr key={idx}>
                {/* Debit Account */}
                <td>
                  {leftTrans ? (
                    <div>
                      <div className="trial-balance-account-name">
                        {leftTrans.journal_type?.code}
                      </div>
                      <div className="trial-balance-account-desc">
                        {leftTrans.journal_type?.name}
                      </div>
                    </div>
                  ) : (
                    <span className="trial-balance-empty-cell">-</span>
                  )}
                </td>
                {/* Debit Amount */}
                <td className="text-right">
                  {leftTrans
                    ? formatCurrency(leftTrans.amount || 0, payment.currency)
                    : "-"}
                </td>
                {/* Credit Account */}
                <td>
                  {rightTrans ? (
                    <div>
                      <div className="trial-balance-account-name">
                        {rightTrans.journal_type?.code}
                      </div>
                      <div className="trial-balance-account-desc">
                        {rightTrans.journal_type?.name}
                      </div>
                    </div>
                  ) : (
                    <span className="trial-balance-empty-cell">-</span>
                  )}
                </td>
                {/* Credit Amount */}
                <td className="text-right">
                  {rightTrans
                    ? formatCurrency(rightTrans.amount || 0, payment.currency)
                    : "-"}
                </td>
              </tr>
            );
          })}

          {/* Totals Row */}
          <tr className="totals-row">
            <td>Total</td>
            <td className="text-right">
              {formatCurrency(leftTotal, payment.currency)}
            </td>
            <td>Total</td>
            <td className="text-right">
              {formatCurrency(rightTotal, payment.currency)}
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
