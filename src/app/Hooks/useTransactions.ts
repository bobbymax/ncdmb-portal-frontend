import { useAuth } from "app/Context/AuthContext";
import { ChartOfAccountResponseData } from "app/Repositories/ChartOfAccount/data";
import { EntityResponseData } from "app/Repositories/Entity/data";
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

  // Set taxable Amount
  // Subtract taxable amount from Total Amount Approved
  // Check transaction type for payment i.e. debit/credit
  // If debit create first transaction i.e. credit and debit leg
  // ..contd. for the result (approvedAmount - taxAmount)
  // if payment is debit
  /**
   * {
   *    user_id: logged-in user
   *    department_id: logged-in user's department
   *    payment_id: payment.id,
   *    ledger_id: get ledger H id
   *    chart_of_account_id: select account code
   *    type: debit/credit
   *    amount: result
   *    narration:
   *    beneficiary_id:
   *    beneficiary_type:
   *    currency: payment.currency
   * }
   */

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

  //   console.log(dependencies);

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
