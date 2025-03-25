import { ColumnData } from "resources/views/components/tables/CustomDataTable";

export const signatoryColumns: ColumnData[] = [
  { accessor: "page_name", label: "Page", type: "text" },
  { accessor: "group_name", label: "Group", type: "text" },
  { accessor: "department", label: "Department", type: "text" },
  { accessor: "order", label: "Order", type: "text" },
];
