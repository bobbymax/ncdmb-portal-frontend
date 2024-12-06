import { ColumnData } from "resources/views/components/tables/CustomDataTable";

export const departmentColumns: ColumnData[] = [
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
    label: "ABV",
    accessor: "abv",
    type: "text",
  },
  {
    label: "Type",
    accessor: "type",
    type: "text",
  },
];
