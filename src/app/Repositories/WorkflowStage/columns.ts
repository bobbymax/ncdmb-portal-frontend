import { ColumnData } from "resources/views/components/tables/CustomDataTable";

export const workflowStageColumns: ColumnData[] = [
  {
    label: "Name",
    accessor: "name",
    type: "text",
  },
  {
    label: "Department",
    accessor: "department_name",
    type: "text",
  },
];
