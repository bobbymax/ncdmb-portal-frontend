import { ColumnData } from "resources/views/components/tables/CustomDataTable";

export const budgetHeadColumns: ColumnData[] = [
  {
    label: "Code",
    accessor: "code",
    type: "text",
  },
  {
    label: "Name",
    accessor: "name",
    type: "text",
  },
  {
    label: "Blocked",
    accessor: "is_blocked",
    type: "text",
  },
];
