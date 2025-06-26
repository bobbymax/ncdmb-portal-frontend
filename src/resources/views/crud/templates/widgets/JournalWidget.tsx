import React, { useCallback, useEffect, useMemo, useState } from "react";
import { SidebarProps } from "../sidebars/AnalysisSidebar";
import { PaymentResponseData } from "app/Repositories/Payment/data";
import useAccountingHooks from "app/Hooks/useAccountingHooks";
import TransactionTrailBalanceTable from "resources/views/components/partials/TransactionTrailBalanceTable";
import { DocumentActionResponseData } from "app/Repositories/DocumentAction/data";
import Button from "resources/views/components/forms/Button";
import {
  ProcessedDataProps,
  ServerSideProcessedDataProps,
} from "app/Context/FileProcessorProvider";
import { extractModelName, repo, toServiceName } from "bootstrap/repositories";
import { TransactionResponseData } from "app/Repositories/Transaction/data";
import useEditorResources from "app/Hooks/useEditorResources";
import _ from "lodash";
import { DocumentResponseData } from "app/Repositories/Document/data";
import { toast } from "react-toastify";

const JournalWidget: React.FC<SidebarProps<PaymentResponseData>> = ({
  tracker,
  resource: payment,
  widget,
  document,
  hasAccessToOperate,
  actions,
  currentDraft,
  updateRaw,
}) => {
  const paymentRepo = useMemo(() => repo("payment"), []);
  const { currentServerState, transmit } = useEditorResources(paymentRepo);
  const [localState, setLocalState] = useState<
    ServerSideProcessedDataProps<TransactionResponseData>
  >({} as ServerSideProcessedDataProps<TransactionResponseData>);

  const [approvedTransactions, setApprovedTransactions] = useState<
    ProcessedDataProps<TransactionResponseData>[]
  >([]);

  const { transactions } = useAccountingHooks(payment, payment.books ?? []);
  const { transactions: adjusted } = useAccountingHooks(
    payment,
    payment.books ?? [],
    "total_amount_paid"
  );

  const journalAction: DocumentActionResponseData | undefined = useMemo(() => {
    if (!actions) return;
    return actions.find((acc) => acc.label === "post-journal") ?? undefined;
  }, [actions]);

  const handleDocumentReview = useCallback(
    (response: DocumentResponseData) => {
      toast.success("Journal Posted successfully!!");
      if (updateRaw) {
        updateRaw(response);
      }
    },
    [updateRaw]
  );

  const postJournal = useCallback(
    (action: DocumentActionResponseData) => {
      if (!localState || approvedTransactions.length < 1) return;

      transmit(action, localState, approvedTransactions, handleDocumentReview);
    },
    [localState, approvedTransactions]
  );

  useEffect(() => {
    const serverState: ServerSideProcessedDataProps<TransactionResponseData> =
      currentServerState as unknown as ServerSideProcessedDataProps<TransactionResponseData>;

    const resource = toServiceName(extractModelName(payment.resource_type));

    setLocalState((prev) => ({
      ...prev,
      ...serverState,
      service: "journal",
      method: "publish",
      state: {
        ...serverState.state,
        resource_id: payment.resource_id,
      },
      resources: approvedTransactions,
      trigger_workflow_id: tracker.internal_process_id,
      entity_type: resource,
      status: "posted",
      document_type: "journal",
      document_category: `${payment.type}-journal`,
    }));
  }, [currentServerState, approvedTransactions, payment]);

  useEffect(() => {
    const approved = _.merge({}, transactions, adjusted);

    const approvedPayments = Object.values(approved)
      .flatMap((entry) =>
        entry ? (Array.isArray(entry) ? entry : [entry]) : []
      )
      .map((entry) => ({
        raw: entry as TransactionResponseData, // assert to full type
        status: "cleared",
        actionPerformed: "exact",
      })) as ProcessedDataProps<TransactionResponseData>[];

    if (approved) {
      setApprovedTransactions(approvedPayments);
    }
  }, [transactions, adjusted]);

  //   console.log(transactions, adjusted);

  return (
    <>
      <div className="row">
        <div className="col-md-12 mb-4">
          <h3>{widget.title}</h3>
        </div>
        <div className="col-md-12 mb-3">
          <p className="ledger-title">Prepared Ledger</p>
          <TransactionTrailBalanceTable transactions={transactions} />
        </div>
        <div className="col-md-12 mb-3">
          <p className="ledger-title">Adjusted Ledger</p>
          <TransactionTrailBalanceTable transactions={adjusted} adjusted />
        </div>
        <div className="col-md-12 mt-3 mb-3">
          {journalAction && (
            <Button
              label={journalAction.button_text}
              handleClick={() => postJournal(journalAction)}
              size="sm"
              icon={journalAction.icon}
              variant={journalAction.variant}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default JournalWidget;
