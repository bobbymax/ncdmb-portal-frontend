import { ColumnData } from "resources/views/components/tables/CustomDataTable";

export const subBudgetHeadColumns: ColumnData[] = [
  { label: "Budget Head", accessor: "budget_head_name", type: "text" },
  { label: "Name", accessor: "name", type: "text" },
  { label: "Type", accessor: "type", type: "text" },
];
