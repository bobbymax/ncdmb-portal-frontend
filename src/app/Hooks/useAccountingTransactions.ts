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

export interface TransactionLedgerProps {
  user_id: number;
  ledger_id: number;
  gross_payment: number;
  taxable_amount: number;
  sub_total: number;
  vat_amount: number;
  admin_fee: number;
  payment: PaymentResponseData;
  transactions: Partial<TransactionResponseData>[];
  journalTypes: JournalTypeResponseData[];
}

type DependencyProps = {
  ledgers: LedgerResponseData[];
  chartOfAccounts: ChartOfAccountResponseData[];
  entities: EntityResponseData[];
  users: UserResponseData[];
  journalTypes: JournalTypeResponseData[];
};

const useAccountingTransactions = () => {
  const { staff } = useAuth();
  const transactionRepo = useMemo(() => repo("transaction"), []);
  const [payment, setPayment] = useState<PaymentResponseData | null>(null);
  const [dependencies, setDependencies] = useState<DependencyProps>(
    {} as DependencyProps
  );
  const [ledgerState, setLedgerState] = useState<TransactionLedgerProps>(
    {} as TransactionLedgerProps
  );

  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      const { name, value, type } = e.target;

      setLedgerState((prevState) => ({
        ...prevState,
        [name]: type === "number" ? value : value,
      }));
    },
    []
  );

  const handleCheckbox = (
    isChecked: boolean,
    journalType: JournalTypeResponseData
  ) => {
    if (isChecked && !ledgerState.journalTypes?.includes(journalType)) {
      setLedgerState((prev) => ({
        ...prev,
        journalTypes: [...(prev.journalTypes ?? []), journalType],
      }));
    } else {
      setLedgerState((prev) => ({
        ...prev,
        journalTypes: prev.journalTypes
          ? (prev.journalTypes ?? []).filter((jt) => jt.id !== journalType.id)
          : prev.journalTypes ?? [],
      }));
    }
  };

  useEffect(() => {
    if (!transactionRepo) return;

    const getDependencies = async () => {
      try {
        const response = await transactionRepo.dependencies();
        if (!response) return;

        setDependencies(response as unknown as DependencyProps);

        // console.log(users);
      } catch (error) {
        console.log(error);
        return;
      }
    };

    if (transactionRepo.associatedResources.length > 0) {
      getDependencies();
    }
  }, [transactionRepo]);

  return {
    ledgerState,
    setLedgerState,
    dependencies,
    handleChange,
    handleCheckbox,
    payment,
    setPayment,
  };
};

export default useAccountingTransactions;
