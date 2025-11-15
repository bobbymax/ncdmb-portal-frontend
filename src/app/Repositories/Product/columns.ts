import { ColumnData } from "resources/views/components/tables/CustomDataTable";
export const productColumns: ColumnData[] = [
  {
    label: "Product Name",
    accessor: "name",
    type: "text",
  },
  {
    label: "Code",
    accessor: "code",
    type: "text",
  },
  {
    label: "Category",
    accessor: "category_name",
    type: "text",
  },
  {
    label: "Department",
    accessor: "department_name",
    type: "text",
  },
];
