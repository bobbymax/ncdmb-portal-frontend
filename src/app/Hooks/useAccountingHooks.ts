import { PaymentResponseData } from "app/Repositories/Payment/data";
import { repo } from "bootstrap/repositories";
import { useCallback, useEffect, useMemo } from "react";
import useRepo from "./useRepo";
import { LedgerResponseData } from "app/Repositories/Ledger/data";
import { ChartOfAccountResponseData } from "app/Repositories/ChartOfAccount/data";
import { EntityResponseData } from "app/Repositories/Entity/data";
import { UserResponseData } from "app/Repositories/User/data";
import { JournalTypeResponseData } from "app/Repositories/JournalType/data";
import { useFileProcessor } from "app/Context/FileProcessorProvider";
import { TransactionResponseData } from "app/Repositories/Transaction/data";
import currency from "currency.js";
import { generateUniqueString, pluck } from "app/Support/Helpers";

type DependencyProps = {
  ledgers: LedgerResponseData[];
  chartOfAccounts: ChartOfAccountResponseData[];
  entities: EntityResponseData[];
  users: UserResponseData[];
  journalTypes: JournalTypeResponseData[];
};

export type TransactionLinesProp = {
  gross: Partial<TransactionResponseData> | undefined;
  components?: Partial<TransactionResponseData>[];
  reimbursement?: Partial<TransactionResponseData> | undefined;
  net: Partial<TransactionResponseData> | undefined;
};

const useAccountingHooks = (
  payment: PaymentResponseData,
  journalTypes?: JournalTypeResponseData[],
  column?: keyof PaymentResponseData
) => {
  const transactionRepo = useMemo(() => repo("transaction"), []);
  const { dependencies } = useRepo(transactionRepo) as {
    dependencies: DependencyProps;
  };

  const { processTransactionLines } = useFileProcessor();

  const getChartOfAccountID = useCallback(
    (book: JournalTypeResponseData): number => {
      if (!payment.transactions || (payment.transactions ?? []).length < 1)
        return 0;

      const chart = payment.transactions.find(
        (trx) => trx.journal_type_id === book.id
      );

      return chart ? chart.chart_of_account_id : 0;
    },
    [payment.transactions]
  );

  const addTransaction = (
    rule: JournalTypeResponseData,
    amount: number,
    type: "debit" | "credit",
    flag: "suspense" | "expense" | "remittance",
    balance: "left" | "right",
    beneficiary: "staff" | "third-party" | "entity" = "entity",
    addBeneficiary = false,
    ruleFlag?: "payable" | "ledger" | "retire",
    chartOfAccountId?: number
  ): Partial<TransactionResponseData> => ({
    narration:
      flag === "remittance"
        ? "Gross"
        : flag === "suspense"
        ? `${rule.code} Suspense`
        : rule.code === "NET"
        ? `${rule.code} Payable`
        : rule.code,
    type,
    chart_of_account_id: chartOfAccountId ?? 0,
    ledger_id: rule.ledger_id,
    journal_type_id: rule.id,
    reference: generateUniqueString(21),
    amount,
    currency: payment.currency ?? "NGN",
    payment_method: "bank-transfer",
    payment_id: payment.id,
    status: "pending",
    trail_balance: balance,
    flag: ruleFlag ?? rule.flag,
  });

  const transactions: TransactionLinesProp | undefined = useMemo(() => {
    if (!payment) return;

    const journalList = dependencies.journalTypes ?? [];
    const lines: TransactionLinesProp = {
      gross: undefined,
      components: [],
      reimbursement: undefined,
      net: undefined,
    };

    const col = column ? column : "total_approved_amount";

    const amount = Number(payment[col]);
    const approvedAmount = currency(amount);

    const taxCol =
      column && payment.type !== "staff" ? column : "total_taxable_amount";

    const taxable = currency(Number(payment[taxCol]));

    let actualVat = currency(0);

    const grossPay = journalList.find((rule) => rule.code === "GRP");
    const vatRule = journalList.find((rule) => rule.code === "VAT");
    const netPay = journalList.find((rule) => rule.code === "NET");
    const reimPay = journalList.find((rule) => rule.code === "REIM");

    if ((payment.transactions ?? []).length > 0 && !column) {
      for (const trx of payment.transactions!) {
        switch (trx.journal_type?.id) {
          case grossPay?.id:
            lines.gross = trx;
            break;
          case reimPay?.id:
            lines.reimbursement = trx;
            break;
          case netPay?.id:
            lines.net = trx;
            break;
          default:
            (lines.components ?? []).push(trx);
        }
      }
    } else {
      if (grossPay) {
        const grossChatOfAccountID: number = getChartOfAccountID(grossPay);

        lines.gross = addTransaction(
          grossPay,
          approvedAmount.value,
          "debit",
          "remittance",
          "left",
          "entity",
          false,
          grossPay.flag,
          grossChatOfAccountID
        );
      }

      if (vatRule && payment.type !== "staff" && taxable.value > 0) {
        actualVat = taxable.multiply(
          vatRule.tax_rate / (100 + vatRule.tax_rate)
        );
      }

      const books = (journalTypes ?? []).filter(
        (book) => book.state !== "fixed" && book.code !== "VAT"
      );

      const baseTaxable = taxable.subtract(actualVat);
      let totalDeductions = actualVat;

      books.forEach((rule) => {
        if (!lines.components) lines.components = [];
        const accountId: number = getChartOfAccountID(rule);
        if (rule.code === "VAT") {
          lines.components.push(
            addTransaction(
              rule,
              actualVat.value,
              "debit",
              "suspense",
              "left",
              "entity",
              false,
              "ledger",
              accountId
            )
          );
          lines.components.push(
            addTransaction(
              rule,
              actualVat.value,
              "credit",
              "expense",
              "right",
              "entity",
              false,
              "payable",
              accountId
            )
          );
        } else {
          const deduction = baseTaxable.multiply(rule.tax_rate / 100);
          const amount =
            rule.context === "holding" ? approvedAmount.value : deduction.value;
          totalDeductions = totalDeductions.add(deduction);

          if (rule.type === "both") {
            lines.components.push(
              addTransaction(
                rule,
                deduction.value,
                "debit",
                "suspense",
                "left",
                "entity",
                false,
                rule.flag,
                accountId
              )
            );
            lines.components.push(
              addTransaction(
                rule,
                deduction.value,
                "credit",
                "expense",
                "right",
                "entity",
                false,
                "payable",
                accountId
              )
            );
          } else {
            lines.components.push(
              addTransaction(
                rule,
                amount,
                rule.type,
                rule.type === "credit" ? "expense" : "suspense",
                "right",
                "entity",
                rule.benefactor === "beneficiary",
                rule.flag,
                accountId
              )
            );
          }
        }
      });

      const netTaxableReimbursement = taxable.subtract(totalDeductions);
      const nonTaxableAmount = approvedAmount.subtract(taxable);

      if (reimPay && netTaxableReimbursement.value > 0) {
        const remAccountId = getChartOfAccountID(reimPay);
        lines.reimbursement = addTransaction(
          reimPay,
          netTaxableReimbursement.value,
          "credit",
          "expense",
          "right",
          payment.expenditure?.expense_type,
          true,
          reimPay.flag,
          remAccountId
        );
      }

      if (netPay && nonTaxableAmount.value > 0) {
        const netAccountId = getChartOfAccountID(netPay);
        lines.net = addTransaction(
          netPay,
          nonTaxableAmount.value,
          "credit",
          "expense",
          "right",
          payment.expenditure?.expense_type,
          true,
          netPay.flag,
          netAccountId
        );
      }
    }

    return lines;
  }, [payment, journalTypes, dependencies.journalTypes, column]);

  useEffect(() => {
    if (transactions) {
      processTransactionLines(transactions);
    }
  }, [transactions]);

  return { transactions };
};

export default useAccountingHooks;
