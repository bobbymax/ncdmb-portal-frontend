import { ColumnData } from "resources/views/components/tables/CustomDataTable";

export const fileTemplateColumns: ColumnData[] = [
  { accessor: "name", label: "Name", type: "text" },
  { accessor: "service", label: "Service", type: "text" },
  { accessor: "component", label: "Component", type: "text" },
];
