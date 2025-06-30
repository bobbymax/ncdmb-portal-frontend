import { ColumnData } from "resources/views/components/tables/CustomDataTable";

export const blockColumns: ColumnData[] = [
  { accessor: "title", type: "text", label: "Title" },
  { accessor: "data_type", type: "text", label: "Data Block" },
  { accessor: "input_type", type: "text", label: "Input Block" },
];
