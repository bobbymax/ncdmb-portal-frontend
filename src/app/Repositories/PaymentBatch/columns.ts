import { ColumnData } from "resources/views/components/tables/CustomDataTable";

export const paymentBatchColumns: ColumnData[] = [
  { label: "Code", accessor: "code", type: "text" },
  { label: "Budget Head", accessor: "budget_head_code", type: "text" },
  { label: "Type", accessor: "type", type: "text" },
  { label: "Total Amount", accessor: "total_amount", type: "text" },
  { label: "Raised", accessor: "created_at", type: "text" },
];
