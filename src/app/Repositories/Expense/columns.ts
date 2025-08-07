import { ColumnData } from "resources/views/components/tables/CustomDataTable";

export const expenseColumns: ColumnData[] = [
  { label: "Date", accessor: "date", type: "date" },
  { label: "Description", accessor: "description", type: "text" },
  { label: "Amount", accessor: "total_amount_spent", type: "currency" },
];
