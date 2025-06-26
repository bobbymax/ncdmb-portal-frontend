import React, { useCallback, useEffect, useMemo } from "react";
import { SidebarProps } from "../sidebars/AnalysisSidebar";
import { PaymentResponseData } from "app/Repositories/Payment/data";
import useAccountingHooks from "app/Hooks/useAccountingHooks";
import { formatAmountNoCurrency } from "app/Support/Helpers";
import TransactionTrailBalanceTable from "resources/views/components/partials/TransactionTrailBalanceTable";
import { useFileProcessor } from "app/Context/FileProcessorProvider";
import ResourceEditableComponent from "resources/views/components/partials/ResourceEditableComponent";
import { ExpenditureableProps } from "app/Repositories/Expenditure/data";
import { DocumentActionResponseData } from "app/Repositories/DocumentAction/data";
import { DocumentResponseData } from "app/Repositories/Document/data";
import { toast } from "react-toastify";

const LedgerATreasuryWidget: React.FC<SidebarProps<PaymentResponseData>> = ({
  tracker,
  resource,
  widget,
  document,
  hasAccessToOperate,
  actions,
  currentDraft,
  updateRaw,
}) => {
  const payment: PaymentResponseData = useMemo(() => resource, [resource]);
  const { transactions } = useAccountingHooks(payment, payment.books ?? []);

  const claimActions: DocumentActionResponseData[] = useMemo(() => {
    return actions.filter(
      (action) =>
        action.label === "clear" ||
        action.label === "alter-amount" ||
        action.label === "reject-payment-or-expense"
    );
  }, [actions]);

  const handleResponse = useCallback(
    (data: DocumentResponseData) => {
      if (!data || !updateRaw) return;

      updateRaw(data);
      toast.success("Expenses processed successfully!!");
    },
    [updateRaw]
  );

  return (
    <>
      <div className="top__title__header">
        <h3
          style={{
            fontSize: 16,
            letterSpacing: 2,
            textTransform: "uppercase",
            fontWeight: 700,
            color: "green",
          }}
        >
          {widget.title}
        </h3>
      </div>
      <div className="editable__area mt-5 mb-5">
        <ResourceEditableComponent
          resource={
            payment.expenditure?.expenditureable as ExpenditureableProps
          }
          response={handleResponse}
          service={payment.resource_type}
          title="Expense Analysis"
          actions={claimActions}
          currentTracker={tracker}
        />
      </div>
      <div className="row mt-4">
        <TransactionTrailBalanceTable transactions={transactions} />
      </div>
    </>
  );
};

export default LedgerATreasuryWidget;
