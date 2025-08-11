import { ColumnData } from "resources/views/components/tables/CustomDataTable";

export const groupColumns: ColumnData[] = [
  {
    accessor: "name",
    label: "Name",
    type: "text",
  },
  {
    accessor: "rank",
    label: "Rank",
    type: "text",
  },
  {
    accessor: "scope",
    label: "Scope",
    type: "text",
  },
];
