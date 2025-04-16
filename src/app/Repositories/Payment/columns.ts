import { ColumnData } from "resources/views/components/tables/CustomDataTable";

export const paymentColumns: ColumnData[] = [
  { accessor: "beneficiary", label: "Beneficiary", type: "text" },
  { accessor: "batch_no", label: "Batch", type: "text" },
  { accessor: "payment_method", label: "Method", type: "text" },
  { accessor: "payment_type", label: "Type", type: "text" },
  { accessor: "currency", label: "Currency", type: "text" },
  { accessor: "period", label: "Period", type: "text" },
  { accessor: "total_amount_payable", label: "Amount", type: "text" },
];
