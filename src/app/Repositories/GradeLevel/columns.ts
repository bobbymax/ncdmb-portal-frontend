import { ColumnData } from "resources/views/components/tables/CustomDataTable";

export const gradeLevelColumns: ColumnData[] = [
  {
    label: "Name",
    accessor: "name",
    type: "text",
  },
  {
    label: "Key",
    accessor: "key",
    type: "text",
  },
  {
    label: "Type",
    accessor: "type",
    type: "text",
  },
];
