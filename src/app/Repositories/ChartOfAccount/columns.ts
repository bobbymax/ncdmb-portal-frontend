import { ColumnData } from "resources/views/components/tables/CustomDataTable";

export const chartOfAccountColumns: ColumnData[] = [
  { accessor: "account_code", label: "Account Code", type: "text" },
  { accessor: "name", label: "Name", type: "text" },
  { accessor: "type", label: "Account Type", type: "text" },
  { accessor: "level", label: "Level", type: "text" },
  { accessor: "status", label: "Status", type: "text" },
];
