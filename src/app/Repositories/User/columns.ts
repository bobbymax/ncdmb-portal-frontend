import { ColumnData } from "resources/views/components/tables/CustomDataTable";

export const userColumns: ColumnData[] = [
  {
    label: "Firstname",
    accessor: "firstname",
    type: "text",
  },
  {
    label: "Surname",
    accessor: "surname",
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
