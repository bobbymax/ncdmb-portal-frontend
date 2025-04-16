import { ColumnData } from "resources/views/components/tables/CustomDataTable";

export const ledgerColumns: ColumnData[] = [
  { accessor: "name", label: "Name", type: "text" },
  { accessor: "code", label: "Code", type: "text" },
];
