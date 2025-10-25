import { ColumnData } from "resources/views/components/tables/CustomDataTable";

export const documentPanelColumns: ColumnData[] = [
  { label: "Name", accessor: "name", type: "text" },
  { label: "Icon", accessor: "icon", type: "text" },
  { label: "Component Path", accessor: "component_path", type: "text" },
  { label: "Order", accessor: "order", type: "text" },
  { label: "Visibility Mode", accessor: "visibility_mode", type: "text" },
];
