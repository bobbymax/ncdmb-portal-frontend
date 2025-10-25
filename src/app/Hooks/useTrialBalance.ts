import { useMemo } from "react";
import { TransactionResponseData } from "@/app/Repositories/Transaction/data";

export interface TrialBalanceResult {
  leftTransactions: Partial<TransactionResponseData>[];
  rightTransactions: Partial<TransactionResponseData>[];
  leftTotal: number;
  rightTotal: number;
  totalDebits: number;
  totalCredits: number;
  isBalanced: boolean;
  variance: number;
}

/**
 * Custom hook to calculate trial balance from transactions
 *
 * @param transactions Array of transaction data
 * @param tolerance Acceptable variance for balance check (default: 0.01)
 * @returns TrialBalanceResult with calculated totals and balance status
 *
 * @example
 * ```tsx
 * const { leftTotal, rightTotal, isBalanced, variance } = useTrialBalance(transactions);
 * ```
 */
export const useTrialBalance = (
  transactions: Partial<TransactionResponseData>[],
  tolerance: number = 0.01
): TrialBalanceResult => {
  return useMemo(() => {
    // Separate transactions by trail balance side
    const leftTransactions = transactions.filter(
      (t) => t.trail_balance === "left"
    );
    const rightTransactions = transactions.filter(
      (t) => t.trail_balance === "right"
    );

    // Calculate left side total (debits)
    // Use debit_amount if available (from DB), otherwise fall back to amount (generated)
    const leftTotal = leftTransactions.reduce(
      (sum, t) => sum + (t.debit_amount || t.amount || 0),
      0
    );

    // Calculate right side total (credits)
    // Use credit_amount if available (from DB), otherwise fall back to amount (generated)
    const rightTotal = rightTransactions.reduce(
      (sum, t) => sum + (t.credit_amount || t.amount || 0),
      0
    );

    // Calculate total debits (using debit_amount field)
    const totalDebits = transactions.reduce(
      (sum, t) => sum + (t.debit_amount || 0),
      0
    );

    // Calculate total credits (using credit_amount field)
    const totalCredits = transactions.reduce(
      (sum, t) => sum + (t.credit_amount || 0),
      0
    );

    // Calculate variance
    const variance = Math.abs(totalDebits - totalCredits);

    // Determine if balanced within tolerance
    const isBalanced = variance < tolerance;

    return {
      leftTransactions,
      rightTransactions,
      leftTotal,
      rightTotal,
      totalDebits,
      totalCredits,
      isBalanced,
      variance,
    };
  }, [transactions, tolerance]);
};
