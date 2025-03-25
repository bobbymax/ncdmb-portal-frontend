import { ColumnData } from "resources/views/components/tables/CustomDataTable";

export const widgetColumns: ColumnData[] = [
  { label: "Title", accessor: "title", type: "text" },
  { label: "Component", accessor: "component", type: "text" },
  { label: "Response", accessor: "response", type: "text" },
  { label: "Type", accessor: "type", type: "text" },
];
