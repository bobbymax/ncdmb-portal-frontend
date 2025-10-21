/**
 * Example usage of usePaymentTransactions hook
 * This file demonstrates how to use the payment transactions hook in different scenarios
 */

import React from "react";
import { usePaymentTransactions } from "./usePaymentTransactions";
import { PaymentResponseData } from "@/app/Repositories/Payment/data";
import { JournalTypeResponseData } from "@/app/Repositories/JournalType/data";

// ============================================================================
// EXAMPLE 1: Single Payment Transaction Generation
// ============================================================================
export const SinglePaymentProcessor: React.FC<{
  payment: PaymentResponseData;
  journalTypes: JournalTypeResponseData[];
  selectedJournalTypeIds: number[];
}> = ({ payment, journalTypes, selectedJournalTypeIds }) => {
  const { transactions, trialBalance, amounts } = usePaymentTransactions(
    payment,
    journalTypes,
    selectedJournalTypeIds
  );

  return (
    <div>
      <h3>Payment Details</h3>
      <div>Beneficiary: {payment.beneficiary}</div>
      <div>Gross Amount: {amounts.gross.toFixed(2)}</div>
      <div>Taxable Amount: {amounts.taxable.toFixed(2)}</div>
      <div>VAT Rate: {amounts.vatRate}%</div>

      <h3>Generated Transactions</h3>
      <p>Total Transactions: {transactions.length}</p>
      <p>Total Debits: {trialBalance.totalDebits.toFixed(2)}</p>
      <p>Total Credits: {trialBalance.totalCredits.toFixed(2)}</p>
      <p>
        Status:{" "}
        {trialBalance.isBalanced ? (
          <span style={{ color: "green" }}>✓ Balanced</span>
        ) : (
          <span style={{ color: "red" }}>
            ✗ Imbalanced (Variance: {trialBalance.variance.toFixed(2)})
          </span>
        )}
      </p>

      <table>
        <thead>
          <tr>
            <th>Narration</th>
            <th>Type</th>
            <th>Debit</th>
            <th>Credit</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((trans, idx) => (
            <tr key={idx}>
              <td>{trans.narration}</td>
              <td>{trans.type}</td>
              <td>{trans.debit_amount?.toFixed(2) || "-"}</td>
              <td>{trans.credit_amount?.toFixed(2) || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ============================================================================
// EXAMPLE 2: Batch Payment Processing
// ============================================================================
export const BatchPaymentProcessor: React.FC<{
  payments: PaymentResponseData[];
  journalTypes: JournalTypeResponseData[];
  paymentJournalTypeMap: Record<number, number[]>;
}> = ({ payments, journalTypes, paymentJournalTypeMap }) => {
  // Get the generation function from the hook
  const { generateTransactions } = usePaymentTransactions(
    null,
    journalTypes,
    []
  );

  // Generate transactions for all payments
  const allPaymentTransactions = React.useMemo(() => {
    return payments.map((payment) => {
      const selectedJTIds = paymentJournalTypeMap[payment.id] || [];
      const transactions = generateTransactions(payment, selectedJTIds);
      return {
        payment,
        transactions,
        count: transactions.length,
      };
    });
  }, [payments, paymentJournalTypeMap, generateTransactions]);

  const totalTransactions = allPaymentTransactions.reduce(
    (sum, pt) => sum + pt.count,
    0
  );

  return (
    <div>
      <h3>Batch Payment Processing</h3>
      <p>Total Payments: {payments.length}</p>
      <p>Total Transactions: {totalTransactions}</p>

      {allPaymentTransactions.map(({ payment, transactions, count }) => (
        <div key={payment.id} style={{ marginBottom: "20px" }}>
          <h4>{payment.beneficiary}</h4>
          <p>
            Amount: {payment.total_approved_amount} - Transactions: {count}
          </p>
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// EXAMPLE 3: Interactive Journal Type Selector
// ============================================================================
export const JournalTypeSelector: React.FC<{
  payment: PaymentResponseData;
  availableJournalTypes: JournalTypeResponseData[];
}> = ({ payment, availableJournalTypes }) => {
  const [selectedIds, setSelectedIds] = React.useState<number[]>([]);

  const { transactions, trialBalance } = usePaymentTransactions(
    payment,
    availableJournalTypes,
    selectedIds
  );

  const toggleJournalType = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div>
      <h3>Select Journal Types</h3>
      <div>
        {availableJournalTypes.map((jt) => (
          <label key={jt.id}>
            <input
              type="checkbox"
              checked={selectedIds.includes(jt.id)}
              onChange={() => toggleJournalType(jt.id)}
            />
            {jt.name} ({jt.code})
          </label>
        ))}
      </div>

      <h4>Preview ({transactions.length} transactions)</h4>
      <p>
        Balance Status:{" "}
        {trialBalance.isBalanced ? "✓ Balanced" : "✗ Not Balanced"}
      </p>
      <p>Total Debits: {trialBalance.totalDebits.toFixed(2)}</p>
      <p>Total Credits: {trialBalance.totalCredits.toFixed(2)}</p>
    </div>
  );
};

// ============================================================================
// EXAMPLE 4: Payment Amount Calculator
// ============================================================================
export const PaymentAmountCalculator: React.FC<{
  payment: PaymentResponseData;
  journalTypes: JournalTypeResponseData[];
}> = ({ payment, journalTypes }) => {
  const { amounts } = usePaymentTransactions(payment, journalTypes, []);

  return (
    <div>
      <h3>Payment Amount Breakdown</h3>
      <table>
        <tbody>
          <tr>
            <td>Gross Amount:</td>
            <td>{amounts.gross.toFixed(2)}</td>
          </tr>
          <tr>
            <td>Base Taxable:</td>
            <td>{amounts.baseTaxable.toFixed(2)}</td>
          </tr>
          <tr>
            <td>VAT Rate:</td>
            <td>{amounts.vatRate}%</td>
          </tr>
          <tr>
            <td>Total Taxable (with VAT):</td>
            <td>{amounts.taxable.toFixed(2)}</td>
          </tr>
          <tr>
            <td>Non-Taxable:</td>
            <td>
              {payment.type === "staff"
                ? amounts.gross.toFixed(2)
                : (amounts.gross - amounts.taxable).toFixed(2)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

// ============================================================================
// EXAMPLE 5: Transaction Validator Before Submit
// ============================================================================
export const TransactionValidator: React.FC<{
  payment: PaymentResponseData;
  journalTypes: JournalTypeResponseData[];
  selectedJournalTypeIds: number[];
  onSubmit: (transactions: any[]) => void;
}> = ({ payment, journalTypes, selectedJournalTypeIds, onSubmit }) => {
  const { transactions, trialBalance } = usePaymentTransactions(
    payment,
    journalTypes,
    selectedJournalTypeIds
  );

  const canSubmit = trialBalance.isBalanced && transactions.length > 0;

  return (
    <div>
      <h3>Transaction Validation</h3>

      {/* Validation Checks */}
      <div>
        <p>
          ✓ Transactions Generated: {transactions.length} transaction
          {transactions.length !== 1 ? "s" : ""}
        </p>
        <p>
          {trialBalance.isBalanced ? "✓" : "✗"} Balance Check:{" "}
          {trialBalance.isBalanced ? (
            <span style={{ color: "green" }}>Balanced</span>
          ) : (
            <span style={{ color: "red" }}>
              Imbalanced by {trialBalance.variance.toFixed(2)}
            </span>
          )}
        </p>
      </div>

      {/* Transaction Summary */}
      <div>
        <h4>Transaction Summary</h4>
        <p>Total Debits: {trialBalance.totalDebits.toFixed(2)}</p>
        <p>Total Credits: {trialBalance.totalCredits.toFixed(2)}</p>
        <p>Left Side Total: {trialBalance.leftTotal.toFixed(2)}</p>
        <p>Right Side Total: {trialBalance.rightTotal.toFixed(2)}</p>
      </div>

      {/* Submit Button */}
      <button
        disabled={!canSubmit}
        onClick={() => onSubmit(transactions)}
        style={{
          backgroundColor: canSubmit ? "green" : "gray",
          color: "white",
          padding: "10px 20px",
          cursor: canSubmit ? "pointer" : "not-allowed",
        }}
      >
        {canSubmit ? "Submit Transactions" : "Cannot Submit"}
      </button>

      {!canSubmit && (
        <p style={{ color: "red" }}>
          {transactions.length === 0
            ? "No transactions generated. Please select journal types."
            : "Transactions are not balanced. Please review."}
        </p>
      )}
    </div>
  );
};

// ============================================================================
// EXAMPLE 6: Dynamic Transaction Regeneration
// ============================================================================
export const DynamicTransactionGenerator: React.FC<{
  payments: PaymentResponseData[];
  journalTypes: JournalTypeResponseData[];
}> = ({ payments, journalTypes }) => {
  const [activePaymentId, setActivePaymentId] = React.useState<number | null>(
    null
  );
  const [selectedJTIds, setSelectedJTIds] = React.useState<number[]>([]);

  const activePayment = payments.find((p) => p.id === activePaymentId) || null;

  const { transactions, trialBalance, generateTransactions } =
    usePaymentTransactions(activePayment, journalTypes, selectedJTIds);

  // Regenerate for a different payment on the fly
  const handleRegenerateForPayment = (paymentId: number) => {
    const payment = payments.find((p) => p.id === paymentId);
    if (payment) {
      const newTransactions = generateTransactions(payment, selectedJTIds);
      console.log(
        `Generated ${newTransactions.length} transactions for payment ${paymentId}`
      );
    }
  };

  return (
    <div>
      <h3>Dynamic Transaction Generator</h3>

      {/* Payment Selector */}
      <select
        value={activePaymentId || ""}
        onChange={(e) => setActivePaymentId(Number(e.target.value) || null)}
      >
        <option value="">Select a payment</option>
        {payments.map((p) => (
          <option key={p.id} value={p.id}>
            {p.beneficiary} - {p.total_approved_amount}
          </option>
        ))}
      </select>

      {/* Journal Type Selector */}
      <div>
        <h4>Select Journal Types:</h4>
        {journalTypes.map((jt) => (
          <label key={jt.id}>
            <input
              type="checkbox"
              checked={selectedJTIds.includes(jt.id)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedJTIds([...selectedJTIds, jt.id]);
                } else {
                  setSelectedJTIds(selectedJTIds.filter((id) => id !== jt.id));
                }
              }}
            />
            {jt.name}
          </label>
        ))}
      </div>

      {/* Results */}
      {activePayment && (
        <div>
          <h4>Results for {activePayment.beneficiary}</h4>
          <p>Transactions: {transactions.length}</p>
          <p>
            Status: {trialBalance.isBalanced ? "✓ Balanced" : "✗ Not Balanced"}
          </p>

          {/* Regenerate for other payments */}
          <div>
            <h5>Quick Regenerate for Other Payments:</h5>
            {payments
              .filter((p) => p.id !== activePaymentId)
              .map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleRegenerateForPayment(p.id)}
                >
                  Generate for {p.beneficiary}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
