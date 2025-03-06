import { ColumnData } from "resources/views/components/tables/CustomDataTable";

export const fundColumns: ColumnData[] = [
  { label: "Budget Code", accessor: "budget_code", type: "text" },
  { label: "Budget Head", accessor: "sub_budget_head", type: "text" },
  { label: "Owner", accessor: "owner", type: "text" },
  { label: "Type", accessor: "type", type: "text" },
  { label: "Approved Amount", accessor: "approved_amount", type: "text" },
  { label: "Exhausted", accessor: "exhausted", type: "text" },
];
