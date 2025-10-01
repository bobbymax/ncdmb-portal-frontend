import { ColumnData } from "resources/views/components/tables/CustomDataTable";

export const settingColumns: ColumnData[] = [
  { label: "Key", accessor: "key", type: "text" },
  { label: "Name", accessor: "name", type: "text" },
  { label: "Input Data Type", accessor: "input_data_type", type: "text" },
  { label: "Access Group", accessor: "access_group", type: "text" },
  { label: "Grid", accessor: "layout", type: "text" },
];
