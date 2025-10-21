import { ColumnData } from "resources/views/components/tables/CustomDataTable";

export const journalTypeColumns: ColumnData[] = [
  { accessor: "code", label: "Ledger Code", type: "text" },
  { accessor: "rate", label: "Rate", type: "text" },
  { accessor: "context", label: "Context", type: "text" },
  { accessor: "description", label: "Description", type: "text" },
];
