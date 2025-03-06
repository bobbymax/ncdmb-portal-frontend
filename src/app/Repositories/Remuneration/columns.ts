import { ColumnData } from "resources/views/components/tables/CustomDataTable";

export const remunerationColumns: ColumnData[] = [
  {
    label: "Allowance",
    accessor: "allowance",
    type: "text",
  },
  {
    label: "Currency",
    accessor: "currency",
    type: "text",
  },
  {
    label: "Grade Level",
    accessor: "grade_level",
    type: "text",
  },
  {
    label: "Amount",
    accessor: "amount_formatted",
    type: "text",
  },
];
