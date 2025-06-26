import useRepo from "app/Hooks/useRepo";
import { ChartOfAccountResponseData } from "app/Repositories/ChartOfAccount/data";
import { EntityResponseData } from "app/Repositories/Entity/data";
import { JournalTypeResponseData } from "app/Repositories/JournalType/data";
import { LedgerResponseData } from "app/Repositories/Ledger/data";
import { PaymentResponseData } from "app/Repositories/Payment/data";
import { TransactionResponseData } from "app/Repositories/Transaction/data";
import { UserResponseData } from "app/Repositories/User/data";
import { repo } from "bootstrap/repositories";
import React, { useMemo } from "react";

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

const TransactionSummary = ({
  payment,
  journalTypes,
  column,
  adjusted,
}: {
  payment: PaymentResponseData;
  journalTypes: JournalTypeResponseData[];
  column?: keyof PaymentResponseData;
  adjusted?: boolean;
}) => {
  const transactionRepo = useMemo(() => repo("transaction"), []);
  const { dependencies } = useRepo(transactionRepo) as {
    dependencies: DependencyProps;
  };
  return <div>TransactionSummary</div>;
};

export default TransactionSummary;
