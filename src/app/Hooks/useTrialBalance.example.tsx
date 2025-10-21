/**
 * Example usage of useTrialBalance hook
 * This file demonstrates how to use the trial balance hook in different scenarios
 */

import React from "react";
import { useTrialBalance } from "./useTrialBalance";
import { TransactionResponseData } from "@/app/Repositories/Transaction/data";

// ============================================================================
// EXAMPLE 1: Basic Usage - Display Trial Balance Summary
// ============================================================================
export const TrialBalanceSummary: React.FC<{
  transactions: Partial<TransactionResponseData>[];
}> = ({ transactions }) => {
  const { totalDebits, totalCredits, isBalanced, variance } =
    useTrialBalance(transactions);

  return (
    <div className="trial-balance-summary">
      <h4>Trial Balance Summary</h4>
      <div>
        <strong>Total Debits:</strong> {totalDebits.toFixed(2)}
      </div>
      <div>
        <strong>Total Credits:</strong> {totalCredits.toFixed(2)}
      </div>
      <div>
        <strong>Status:</strong>{" "}
        {isBalanced ? (
          <span style={{ color: "green" }}>✓ Balanced</span>
        ) : (
          <span style={{ color: "red" }}>
            ✗ Imbalanced (Variance: {variance.toFixed(2)})
          </span>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// EXAMPLE 2: Detailed Trial Balance Table
// ============================================================================
export const DetailedTrialBalance: React.FC<{
  transactions: Partial<TransactionResponseData>[];
}> = ({ transactions }) => {
  const {
    leftTransactions,
    rightTransactions,
    leftTotal,
    rightTotal,
    isBalanced,
  } = useTrialBalance(transactions);

  return (
    <div>
      <h4>Detailed Trial Balance</h4>
      <table>
        <thead>
          <tr>
            <th>Debit Accounts</th>
            <th>Amount</th>
            <th>Credit Accounts</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({
            length: Math.max(leftTransactions.length, rightTransactions.length),
          }).map((_, idx) => (
            <tr key={idx}>
              <td>{leftTransactions[idx]?.narration || "-"}</td>
              <td>{leftTransactions[idx]?.amount?.toFixed(2) || "-"}</td>
              <td>{rightTransactions[idx]?.narration || "-"}</td>
              <td>{rightTransactions[idx]?.amount?.toFixed(2) || "-"}</td>
            </tr>
          ))}
          <tr style={{ fontWeight: "bold" }}>
            <td>Total</td>
            <td>{leftTotal.toFixed(2)}</td>
            <td>Total</td>
            <td>{rightTotal.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
      {!isBalanced && (
        <div style={{ color: "red", marginTop: "10px" }}>
          ⚠️ Warning: Trial balance is not balanced
        </div>
      )}
    </div>
  );
};

// ============================================================================
// EXAMPLE 3: Validation Component (Submit button only enabled if balanced)
// ============================================================================
export const TransactionSubmitButton: React.FC<{
  transactions: Partial<TransactionResponseData>[];
  onSubmit: () => void;
}> = ({ transactions, onSubmit }) => {
  const { isBalanced, variance } = useTrialBalance(transactions);

  return (
    <div>
      <button disabled={!isBalanced} onClick={onSubmit}>
        Submit Transactions
      </button>
      {!isBalanced && (
        <p style={{ color: "red" }}>
          Cannot submit: Trial balance is off by {variance.toFixed(2)}
        </p>
      )}
    </div>
  );
};

// ============================================================================
// EXAMPLE 4: With Custom Tolerance
// ============================================================================
export const CustomToleranceBalance: React.FC<{
  transactions: Partial<TransactionResponseData>[];
}> = ({ transactions }) => {
  // Allow up to 1.00 variance (e.g., for currency rounding)
  const { isBalanced, variance } = useTrialBalance(transactions, 1.0);

  return (
    <div>
      <h4>Balance Check (1.00 tolerance)</h4>
      {isBalanced ? (
        <span style={{ color: "green" }}>
          ✓ Balanced within tolerance (variance: {variance.toFixed(2)})
        </span>
      ) : (
        <span style={{ color: "red" }}>
          ✗ Imbalanced (variance: {variance.toFixed(2)} exceeds 1.00)
        </span>
      )}
    </div>
  );
};

// ============================================================================
// EXAMPLE 5: Chart/Visualization Component
// ============================================================================
export const TrialBalanceChart: React.FC<{
  transactions: Partial<TransactionResponseData>[];
}> = ({ transactions }) => {
  const { totalDebits, totalCredits, isBalanced } =
    useTrialBalance(transactions);

  const maxValue = Math.max(totalDebits, totalCredits);

  return (
    <div>
      <h4>Trial Balance Visualization</h4>
      <div style={{ display: "flex", gap: "20px", alignItems: "flex-end" }}>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "100px",
              height: `${(totalDebits / maxValue) * 200}px`,
              backgroundColor: "#dc2626",
              marginBottom: "10px",
            }}
          />
          <div>Debits</div>
          <div>{totalDebits.toFixed(2)}</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "100px",
              height: `${(totalCredits / maxValue) * 200}px`,
              backgroundColor: "#16a34a",
              marginBottom: "10px",
            }}
          />
          <div>Credits</div>
          <div>{totalCredits.toFixed(2)}</div>
        </div>
      </div>
      <div style={{ marginTop: "20px", fontWeight: "bold" }}>
        {isBalanced ? "✓ Balanced" : "✗ Not Balanced"}
      </div>
    </div>
  );
};
