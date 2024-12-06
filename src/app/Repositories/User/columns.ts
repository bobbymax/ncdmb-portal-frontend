import { ColumnData } from "resources/views/components/tables/CustomDataTable";

export const userColumns: ColumnData[] = [
  {
    label: "Name",
    accessor: "name",
    type: "text",
  },
  {
    label: "Email",
    accessor: "email",
    type: "text",
  },
  {
    label: "Staff ID",
    accessor: "staff_no",
    type: "text",
  },
  {
    label: "Logged In",
    accessor: "is_logged_in",
    type: "bool",
  },
];
