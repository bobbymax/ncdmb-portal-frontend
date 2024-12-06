import { ColumnData } from "resources/views/components/tables/CustomDataTable";

export const workflowColumns: ColumnData[] = [
  {
    label: "Name",
    accessor: "name",
    type: "text",
  },
  {
    label: "Description",
    accessor: "description",
    type: "text",
  },
];
