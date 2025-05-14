import React, { useEffect, useState } from "react";
import { SidebarProps } from "../sidebars/AnalysisSidebar";
import { PaymentResponseData } from "app/Repositories/Payment/data";
import {
  ServerSideProcessedDataProps,
  useFileProcessor,
} from "app/Context/FileProcessorProvider";
import { useAuth } from "app/Context/AuthContext";
import useDataProcessor from "app/Hooks/useDataProcessor";
import { formatAmountNoCurrency } from "app/Support/Helpers";
import useTransactions from "app/Hooks/useTransactions";

const LedgerHWidget: React.FC<SidebarProps<PaymentResponseData>> = ({
  tracker,
  resource: payment,
  widget,
  document,
  hasAccessToOperate,
  actions,
  currentDraft,
  updateRaw,
}) => {
  const { staff } = useAuth();
  const { processedData } = useFileProcessor();
  const { dataState, handleDataStateChange } = useDataProcessor(
    payment,
    "payment-voucher",
    `${payment.type}-commitment`,
    "payment",
    payment.type,
    "update",
    "draft",
    "transactions",
    document,
    currentDraft ?? null,
    tracker,
    payment.type
  );

  const { transactionRepo, taxableAmount } = useTransactions(payment);

  //   console.log(taxableAmount);

  return (
    <div className="adjustable_ledger_wrapper">
      {/* Payment Details Here */}
      <div className="beneficiary__details flex column gap-xl">
        <div className="line beneficiary_name mb-2">
          <small>Total Approved Amount:</small>
          <h1>{formatAmountNoCurrency(dataState.total_approved_amount)}</h1>
        </div>
        <div className="line exp__description">
          <small>Total Taxable Amount:</small>
          <h1>
            {formatAmountNoCurrency(
              dataState.total_taxable_amount < 1
                ? taxableAmount
                : dataState.total_taxable_amount
            )}
          </h1>
        </div>
        <div className="line exp__description">
          <small>Total Payable Amount:</small>
          <h1>{dataState.total_amount_paid}</h1>
        </div>
      </div>
      {/* End Payment Details Here */}
    </div>
  );
};

export default LedgerHWidget;
