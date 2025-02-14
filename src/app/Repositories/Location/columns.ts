import { ColumnData } from "resources/views/components/tables/CustomDataTable";

export const locationColumns: ColumnData[] = [
  { accessor: "name", type: "text", label: "Name" },
  { accessor: "city", type: "text", label: "State" },
  { accessor: "active", type: "text", label: "Status" },
];
