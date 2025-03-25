import { ColumnData } from "resources/views/components/tables/CustomDataTable";

export const documentTrailColumns: ColumnData[] = [
  { label: "Ref", accessor: "document_ref", type: "text" },
  { label: "User", accessor: "staff_name", type: "text" },
  { label: "Action", accessor: "action", type: "text" },
  { label: "Date", accessor: "performed_at", type: "text" },
];
