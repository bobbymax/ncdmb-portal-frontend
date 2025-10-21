import { useMemo, useCallback } from "react";
import { PaymentResponseData } from "@/app/Repositories/Payment/data";
import { JournalTypeResponseData } from "@/app/Repositories/JournalType/data";
import { TransactionResponseData } from "@/app/Repositories/Transaction/data";
import { useTrialBalance, TrialBalanceResult } from "./useTrialBalance";

export interface PaymentAmounts {
  gross: number;
  taxable: number;
  vatRate: number;
  baseTaxable: number;
}

export interface PaymentTransactionsResult {
  transactions: Partial<TransactionResponseData>[];
  trialBalance: TrialBalanceResult;
  amounts: PaymentAmounts;
  generateTransactions: (
    payment: PaymentResponseData,
    selectedJournalTypeIds: number[]
  ) => Partial<TransactionResponseData>[];
}

/**
 * Custom hook for generating and managing payment transactions
 *
 * @param payment The payment to generate transactions for
 * @param journalTypes Available journal types for the payment
 * @param selectedJournalTypeIds IDs of journal types to use for generation
 * @returns Transaction generation utilities and trial balance
 *
 * @example
 * ```tsx
 * const { transactions, trialBalance, generateTransactions } = usePaymentTransactions(
 *   payment,
 *   journalTypes,
 *   [1, 2, 5]
 * );
 * ```
 */
export const usePaymentTransactions = (
  payment: PaymentResponseData | null,
  journalTypes: JournalTypeResponseData[],
  selectedJournalTypeIds: number[] = []
): PaymentTransactionsResult => {
  // Calculate payment amounts (gross, taxable, VAT)
  const calculateAmounts = useCallback(
    (paymentData: PaymentResponseData): PaymentAmounts => {
      const gross = parseFloat(paymentData.total_approved_amount.toString());
      let taxable = gross;
      let vatRate = 0;

      if (paymentData.type === "third-party" && paymentData.expenditure) {
        const adminFee = parseFloat(
          paymentData.expenditure.admin_fee_amount.toString()
        );
        const subTotal = parseFloat(
          paymentData.expenditure.sub_total_amount.toString()
        );

        // Determine taxable base
        if (adminFee > 0) {
          taxable = adminFee;
        } else {
          taxable = subTotal;
        }

        // Find VAT rate from journal types
        const vatJournalType = journalTypes.find(
          (jt) =>
            jt.is_vat &&
            (jt.category === paymentData.type || jt.category === "default")
        );

        if (vatJournalType) {
          vatRate = vatJournalType.rate;
          // Calculate total taxable with VAT
          const totalTaxable = taxable * ((100 + vatRate) / 100);
          return {
            gross,
            taxable: totalTaxable,
            vatRate,
            baseTaxable: taxable,
          };
        }
      }

      return { gross, taxable, vatRate, baseTaxable: taxable };
    },
    [journalTypes]
  );

  // Generate transactions based on selected journal types
  const generateTransactions = useCallback(
    (
      paymentData: PaymentResponseData,
      selectedJTIds: number[]
    ): Partial<TransactionResponseData>[] => {
      const { gross, taxable } = calculateAmounts(paymentData);
      const transactions: Partial<TransactionResponseData>[] = [];

      // Filter and sort applicable journal types
      const applicableJournalTypes = journalTypes
        .filter((jt) => selectedJTIds.includes(jt.id))
        .sort((a, b) => a.precedence - b.precedence);

      applicableJournalTypes.forEach((journalType) => {
        let transactionAmount = 0;
        let baseAmount = 0;

        // Determine base amount based on base_selector
        switch (journalType.base_selector) {
          case "GROSS":
            baseAmount = gross;
            break;
          case "TAXABLE":
            baseAmount = taxable;
            break;
          case "NON-TAXABLE":
            baseAmount = paymentData.type === "staff" ? gross : gross - taxable;
            break;
          case "CUSTOM":
            baseAmount = journalType.fixed_amount;
            break;
          default:
            baseAmount = gross;
        }

        // Calculate transaction amount based on rate_type
        if (journalType.rate_type === "percent") {
          transactionAmount = (baseAmount * journalType.rate) / 100;
        } else if (journalType.rate_type === "fixed") {
          transactionAmount = journalType.fixed_amount;
        }

        // Apply rounding
        if (journalType.rounding === "half_up") {
          transactionAmount = Math.round(transactionAmount);
        } else if (journalType.rounding === "bankers") {
          // Bankers rounding (round to nearest even)
          const rounded = Math.round(transactionAmount);
          transactionAmount =
            rounded % 2 === 0 ? rounded : Math.floor(transactionAmount);
        }

        // Determine transaction type (debit/credit) based on kind
        let transactionType: "debit" | "credit" = "debit";
        if (journalType.kind === "deduct") {
          transactionType = "debit";
        } else if (journalType.kind === "add") {
          transactionType = "credit";
        } else {
          // Info type - use journalType.type
          transactionType =
            journalType.type === "both" ? "debit" : journalType.type;
        }

        // Determine trail balance side
        const trailBalance: "left" | "right" =
          transactionType === "debit" ? "left" : "right";

        const beneficiaryId =
          journalType.benefactor === "entity"
            ? journalType.entity_id
            : paymentData.resource_id;

        const beneficiaryType =
          journalType.benefactor === "entity"
            ? "App\\Models\\Entity"
            : paymentData.resource_type;

        // Create main transaction
        const mainTransaction: Partial<TransactionResponseData> = {
          journal_type_id: journalType.id,
          payment_id: paymentData.id,
          chart_of_account_id: paymentData.chart_of_account_id,
          ledger_id: journalType.ledger_id,
          type: transactionType,
          amount: transactionAmount,
          debit_amount: transactionType === "debit" ? transactionAmount : 0,
          credit_amount: transactionType === "credit" ? transactionAmount : 0,
          narration: `${journalType.name} - ${paymentData.narration}`,
          beneficiary_id: beneficiaryId,
          beneficiary_type: beneficiaryType,
          payment_method: paymentData.payment_method ?? "bank-transfer",
          currency: paymentData.expenditure?.currency ?? "NGN",
          trail_balance: trailBalance,
          flag: journalType.flag,
          journal_type: journalType,
        };

        transactions.push(mainTransaction);

        // Create contra entry if required
        if (journalType.posting_rules.create_contra_entries) {
          const contraType = transactionType === "debit" ? "credit" : "debit";
          const contraTransaction: Partial<TransactionResponseData> = {
            journal_type_id: journalType.id,
            chart_of_account_id: paymentData.chart_of_account_id,
            ledger_id: journalType.ledger_id,
            payment_id: paymentData.id,
            type: contraType,
            amount: transactionAmount,
            debit_amount: contraType === "debit" ? transactionAmount : 0,
            credit_amount: contraType === "credit" ? transactionAmount : 0,
            narration: `Contra - ${journalType.name} - ${paymentData.narration}`,
            beneficiary_id: journalType.entity_id,
            beneficiary_type: "entity",
            payment_method: paymentData.payment_method,
            currency: paymentData.currency,
            trail_balance: trailBalance === "left" ? "right" : "left",
            flag: journalType.flag,
            journal_type: journalType,
          };

          transactions.push(contraTransaction);
        }
      });

      return transactions;
    },
    [journalTypes, calculateAmounts]
  );

  // Generate transactions for current payment and selected journal types
  const transactions = useMemo(() => {
    if (!payment) return [];
    return generateTransactions(payment, selectedJournalTypeIds);
  }, [payment, selectedJournalTypeIds, generateTransactions]);

  // Calculate trial balance for generated transactions
  const trialBalance = useTrialBalance(transactions);

  // Calculate amounts for current payment
  const amounts = useMemo(() => {
    if (!payment) {
      return { gross: 0, taxable: 0, vatRate: 0, baseTaxable: 0 };
    }
    return calculateAmounts(payment);
  }, [payment, calculateAmounts]);

  return {
    transactions,
    trialBalance,
    amounts,
    generateTransactions,
  };
};
