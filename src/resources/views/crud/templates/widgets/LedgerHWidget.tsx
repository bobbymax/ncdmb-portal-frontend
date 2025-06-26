import React, { useEffect, useMemo, useState } from "react";
import { SidebarProps } from "../sidebars/AnalysisSidebar";
import { PaymentResponseData } from "app/Repositories/Payment/data";
import {
  ServerSideProcessedDataProps,
  useFileProcessor,
} from "app/Context/FileProcessorProvider";
import { useAuth } from "app/Context/AuthContext";
import useDataProcessor from "app/Hooks/useDataProcessor";
import { formatAmountNoCurrency, formatInputNumber } from "app/Support/Helpers";
import useTransactions from "app/Hooks/useTransactions";
import TextInput from "resources/views/components/forms/TextInput";
import { TransactionResponseData } from "app/Repositories/Transaction/data";
import { JournalTypeResponseData } from "app/Repositories/JournalType/data";
import useAccountingTransactions from "app/Hooks/useAccountingTransactions";
import Box from "resources/views/components/forms/Box";
import useAccountingHooks from "app/Hooks/useAccountingHooks";
import Button from "resources/views/components/forms/Button";
import { DocumentActionResponseData } from "app/Repositories/DocumentAction/data";
import TransactionTrailBalanceTable from "resources/views/components/partials/TransactionTrailBalanceTable";

interface TransactionLedgerProps {
  taxable_amount: string;
  payment: PaymentResponseData;
  transactions: Partial<TransactionResponseData>[];
  journalTypes: JournalTypeResponseData[];
}

const LedgerHWidget: React.FC<SidebarProps<PaymentResponseData>> = ({
  tracker,
  resource,
  widget,
  document,
  hasAccessToOperate,
  actions,
  currentDraft,
  updateRaw,
}) => {
  const [payment, setPayment] = useState<PaymentResponseData>(resource);

  const { ledgerState, setLedgerState, handleCheckbox, dependencies } =
    useAccountingTransactions();
  const {
    processComplete,
    setProcessComplete,
    documentProcessed,
    processedData,
    resolveDataWithAction,
    setDocumentProcessed,
  } = useFileProcessor();

  const { transactions } = useAccountingHooks(
    payment,
    ledgerState.journalTypes ?? []
  );

  const ledgerAction = useMemo(() => {
    if (!actions) return;

    return actions.find(
      (action) =>
        action.is_payment === 1 &&
        action.draft_status === "transactions-generated"
    );
  }, [actions]);

  const resolveTransactions = (action: DocumentActionResponseData) => {
    resolveDataWithAction(action);

    const processedPayment =
      document?.documentable as unknown as PaymentResponseData;

    setPayment(processedPayment);
  };

  useEffect(() => {
    setLedgerState((prev) => ({
      ...prev,
      gross_payment: Number(payment.total_approved_amount),
      journalTypes: [],
      transactions: [],
    }));
    setPayment(payment);
  }, []);

  useEffect(() => {
    if (processedData.length > 0) {
      const complete = processedData.every(
        (tx) => (tx.raw as TransactionResponseData).chart_of_account_id > 0
      );
      setProcessComplete(complete);
    }
  }, [processedData]);

  useEffect(() => {
    if (documentProcessed && updateRaw) {
      updateRaw(documentProcessed);
      setDocumentProcessed(null);
    }
  }, [documentProcessed]);

  return (
    <div className="adjustable_ledger_wrapper">
      <div className="form__area__ledger mb-3">
        <h3 className="mb-4">{widget.title}</h3>

        <div className="row">
          {(payment.transactions ?? []).length < 1 && (
            <div className="col-md-12 mb-3">
              <div className="row">
                <div className="col-md-12 mb-3">
                  <p className="storm-form-label">Payment Components:</p>
                </div>
                {dependencies.journalTypes &&
                (dependencies.journalTypes ?? []).length > 0 ? (
                  dependencies.journalTypes
                    .filter(
                      (jt) =>
                        jt.category === payment.type && jt.state === "optional"
                    )
                    .map((jt, i) => (
                      <div className="col-md-6 mb-3" key={i}>
                        <Box
                          label={`${jt.code}: ${
                            Math.round(jt.tax_rate * 100) / 100
                          }%`}
                          value={jt.id}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            handleCheckbox(isChecked, jt);
                          }}
                          isChecked={ledgerState.journalTypes?.includes(jt)}
                        />
                      </div>
                    ))
                ) : (
                  <p>No Payment Component Here</p>
                )}
              </div>
            </div>
          )}

          <TransactionTrailBalanceTable transactions={transactions} />

          {ledgerAction && (
            <div className="col-md-12 mb-3">
              <Button
                label={ledgerAction.button_text}
                icon={ledgerAction.icon}
                handleClick={() => resolveTransactions(ledgerAction)}
                size="sm"
                variant={ledgerAction.variant}
                isDisabled={ledgerAction.disabled && !processComplete}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LedgerHWidget;
