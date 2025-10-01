import React, { useEffect, useMemo, useState } from "react";
import { ContentBlock } from "../../crud/DocumentTemplateBuilder";
import { DocumentResponseData } from "@/app/Repositories/Document/data";
import { DataOptionsProps } from "../forms/MultiSelect";
import { FundResponseData } from "@/app/Repositories/Fund/data";
import { usePaperBoard } from "app/Context/PaperBoardContext";
import { getContentBlockByType } from "app/Utils/ContentBlockUtils";

interface PaymentBatchContentCardProps {
  item: ContentBlock;
  onClose: () => void;
  isEditing: boolean;
}

export interface PaymentBatchContentDocumentProps extends DocumentResponseData {
  identifier: string;
}

export type PaymentBatchContentProps = {
  purpose: string;
  code?: string;
  no_of_payments: number;
  total_amount: number;
  documents: PaymentBatchContentDocumentProps[];
};

const PaymentBatchContentCard: React.FC<PaymentBatchContentCardProps> = ({
  item,
  onClose,
  isEditing,
}) => {
  const { state } = usePaperBoard();

  //   console.log(state);

  const paymentBatchContent = useMemo(() => {
    const contentBlock = getContentBlockByType(state.body, "payment_batch");
    if (!contentBlock) return null;

    return (
      (contentBlock?.content?.payment_batch as PaymentBatchContentProps) || null
    );
  }, [state.body]);

  // Format currency helper
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Get budget head from fund label
  const getBudgetHead = (): string => {
    if (!state.fund?.label) return "N/A";
    return state.fund.label.split(" - ")[0];
  };

  //   console.log(paymentBatchContent, state.fund);

  if (!paymentBatchContent) {
    return <div>No payment batch content available</div>;
  }

  return (
    <div className="payment-batch-content-card">
      {/* Payment Batch Documents Table */}
      <div className="payment-batch-table-container">
        <table className="payment-batch-table">
          <thead>
            <tr>
              <th>SN</th>
              <th>Beneficiary</th>
              <th>Amount</th>
              <th>Budget Head</th>
              <th>Purpose</th>
              <th>PV Number</th>
            </tr>
          </thead>
          <tbody>
            {paymentBatchContent.documents.map((document, index) => (
              <tr key={document.id}>
                <td>{document.owner?.staff_no || "N/A"}</td>
                <td>{document.owner?.name || "N/A"}</td>
                <td>
                  {formatCurrency(Number(document?.approved_amount) || 0)}
                </td>
                <td
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {getBudgetHead()}
                </td>
                <td>{document.title || "N/A"}</td>
                <td></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Total Amount Display */}
      <div className="payment-batch-total">
        <div className="payment-batch-total-label">Total Amount:</div>
        <div className="payment-batch-total-amount">
          {formatCurrency(paymentBatchContent.total_amount)}
        </div>
      </div>
    </div>
  );
};

export default PaymentBatchContentCard;
