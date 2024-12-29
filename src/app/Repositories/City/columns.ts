import { ColumnData } from "resources/views/components/tables/CustomDataTable";

export const cityColumns: ColumnData[] = [
  {
    label: "Name",
    type: "text",
    accessor: "name",
  },
  {
    label: "Allowance Per Diem",
    type: "text",
    accessor: "allowance",
  },
];
