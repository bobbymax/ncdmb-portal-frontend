import { ColumnData } from "resources/views/components/tables/CustomDataTable";

export const workflowStageColumns: ColumnData[] = [
  {
    label: "Name",
    accessor: "name",
    type: "text",
  },
  {
    label: "Group",
    accessor: "group_name",
    type: "text",
  },
];
