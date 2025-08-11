import { useAuth } from "app/Context/AuthContext";
import { ChartOfAccountResponseData } from "app/Repositories/ChartOfAccount/data";
import { EntityResponseData } from "app/Repositories/Entity/data";
import { JournalTypeResponseData } from "app/Repositories/JournalType/data";
import { LedgerResponseData } from "app/Repositories/Ledger/data";
import { PaymentResponseData } from "app/Repositories/Payment/data";
import { TransactionResponseData } from "app/Repositories/Transaction/data";
import { UserResponseData } from "app/Repositories/User/data";
import { repo } from "bootstrap/repositories";
import { useCallback, useEffect, useMemo, useState } from "react";

type DependencyProps = {
  ledgers: LedgerResponseData[];
  chartOfAccounts: ChartOfAccountResponseData[];
  entities: EntityResponseData[];
  users: UserResponseData[];
  journalTypes: JournalTypeResponseData[];
};

const useTransactions = (payment: PaymentResponseData) => {
  const transactionRepo = useMemo(() => repo("transaction"), []);
  const { staff } = useAuth();
  const [taxableAmount, setTaxableAmount] = useState<number>(
    Number(payment.total_approved_amount)
  );
  const [transactions, setTransactions] = useState<TransactionResponseData[]>(
    []
  );
  const [dependencies, setDependencies] = useState<DependencyProps>(
    {} as DependencyProps
  );

  const adjustableLedger: LedgerResponseData | null = useMemo(() => {
    if (!dependencies || !dependencies.ledgers) return null;
    return dependencies.ledgers.find((ledger) => ledger.code === "H") ?? null;
  }, [dependencies]);

  const buildFirstTransactions = useCallback(() => {
    if (!staff) return;
    const beneficiaryAmount = payment.total_approved_amount - taxableAmount;

    const firstTransactionDebit: Partial<TransactionResponseData> = {};
    const firstTransactionCredit: Partial<TransactionResponseData> = {};
  }, [payment, taxableAmount, staff]);

  useEffect(() => {
    if (!transactionRepo) return;

    const getDependencies = async () => {
      try {
        const response = await transactionRepo.dependencies();
        if (!response) return;

        setDependencies(response as unknown as DependencyProps);
      } catch (error) {
        // Error fetching dependencies
        return;
      }
    };

    if (transactionRepo.associatedResources.length > 0) {
      getDependencies();
    }
  }, [transactionRepo]);

  return {
    transactionRepo,
    transactions,
    taxableAmount,
    setTaxableAmount,
    setTransactions,
    adjustableLedger,
    buildFirstTransactions,
    dependencies,
  };
};

export default useTransactions;
