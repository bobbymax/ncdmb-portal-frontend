import { ColumnData } from "resources/views/components/tables/CustomDataTable";

export const mailingListColumns: ColumnData[] = [
  { accessor: "group_name", type: "text", label: "Group" },
  { accessor: "department_name", type: "text", label: "Department" },
  { accessor: "name", type: "text", label: "Name" },
];
