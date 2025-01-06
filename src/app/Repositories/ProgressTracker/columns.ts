import { ColumnData } from "resources/views/components/tables/CustomDataTable";

export const progressTrackerColumns: ColumnData[] = [
  { accessor: "workflow", label: "Workflow", type: "text" },
  { accessor: "stage", label: "Workflow Stage", type: "text" },
  { accessor: "order", label: "Order", type: "text" },
];