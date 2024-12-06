import { ColumnData } from "resources/views/components/tables/CustomDataTable";

export const roleColumns: ColumnData[] = [
  {
    label: "Name",
    accessor: "name",
    type: "text",
  },
  {
    label: "Department",
    accessor: "department",
    type: "text",
  },
  {
    label: "Slots",
    accessor: "slots",
    type: "text",
  },
];
