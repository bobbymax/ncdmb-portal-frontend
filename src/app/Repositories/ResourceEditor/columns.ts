import { ColumnData } from "resources/views/components/tables/CustomDataTable";

export const resourceEditorColumns: ColumnData[] = [
  { label: "Service", accessor: "service_name", type: "text" },
  { label: "Editable Column", accessor: "resource_column_name", type: "text" },
  { label: "Permission", accessor: "permission", type: "text" },
  { label: "Update", accessor: "service_update", type: "text" },
];
