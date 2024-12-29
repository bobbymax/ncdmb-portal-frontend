import { ColumnData } from "resources/views/components/tables/CustomDataTable";

export const tripCategoryColumns: ColumnData[] = [
  {
    label: "Name",
    accessor: "name",
    type: "text",
  },
  {
    label: "Type",
    accessor: "type",
    type: "text",
  },
  {
    label: "Accommodation Category",
    accessor: "accommodation_type",
    type: "text",
  },
];
