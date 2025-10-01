import { ColumnData } from "resources/views/components/tables/CustomDataTable";

export const templateColumns: ColumnData[] = [
  { label: "Name", accessor: "name", type: "text" },
  { label: "Header", accessor: "header", type: "text" },
  { label: "Signature Display", accessor: "signature_display", type: "text" },
  { label: "With Dates", accessor: "add_dates", type: "text" },
];
