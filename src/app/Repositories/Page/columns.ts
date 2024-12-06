import { ColumnData } from "resources/views/components/tables/CustomDataTable";

export const pageColumns: ColumnData[] = [
  {
    label: "Name",
    accessor: "name",
    type: "text",
  },
  {
    label: "Parent",
    accessor: "parent",
    type: "text",
  },
  {
    label: "Path",
    accessor: "path",
    type: "text",
  },
  {
    label: "Type",
    accessor: "type",
    type: "text",
  },
];
