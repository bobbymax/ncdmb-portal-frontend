import { ColumnData } from "resources/views/components/tables/CustomDataTable";

export const processCardColumns: ColumnData[] = [
  { label: "Name", accessor: "name", type: "text" },
  { label: "Component", accessor: "component", type: "text" },
  { label: "Service", accessor: "service", type: "text" },
];
