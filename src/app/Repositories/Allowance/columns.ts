import { ColumnData } from "resources/views/components/tables/CustomDataTable";

export const allowanceColumns: ColumnData[] = [
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
    label: "Days Required",
    accessor: "status",
    type: "text",
  },
  {
    label: "Active",
    accessor: "active",
    type: "text",
  },
];
