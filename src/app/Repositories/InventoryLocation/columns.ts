import { ColumnData } from "resources/views/components/tables/CustomDataTable";

export const inventoryLocationColumns: ColumnData[] = [
  {
    label: "Location Name",
    accessor: "name",
    type: "text",
  },
  {
    label: "Code",
    accessor: "code",
    type: "text",
  },
  {
    label: "Type",
    accessor: "type",
    type: "text",
  },
  {
    label: "Department",
    accessor: "department_name",
    type: "text",
  },
  {
    label: "Parent",
    accessor: "parent_name",
    type: "text",
  },
  {
    label: "Created",
    accessor: "created_at_display",
    type: "text",
  },
];
