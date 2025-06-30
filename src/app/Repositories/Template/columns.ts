import { ColumnData } from "resources/views/components/tables/CustomDataTable";

export const templateColumns: ColumnData[] = [
  { label: "Name", accessor: "name", type: "text" },
  { label: "Header", accessor: "header", type: "text" },
  { label: "Footer", accessor: "footer", type: "text" },
  { label: "Active", accessor: "active", type: "text" },
];
