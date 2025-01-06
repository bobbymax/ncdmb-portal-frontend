import { ColumnData } from "resources/views/components/tables/CustomDataTable";

export const stageCategoryColumns: ColumnData[] = [
  { label: "Name", accessor: "name", type: "text" },
  { label: "Path", accessor: "icon_path", type: "text" },
];
