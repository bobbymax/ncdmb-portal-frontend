import { ColumnData } from "resources/views/components/tables/CustomDataTable";

export const inventoryReturnColumns: ColumnData[] = [
  {
    label: "Reference",
    accessor: "reference",
    type: "text",
  },
  {
    label: "Location",
    accessor: "location_name",
    type: "text",
  },
  {
    label: "Product",
    accessor: "product_name",
    type: "text",
  },
  {
    label: "Quantity",
    accessor: "quantity",
    type: "text",
  },
  {
    label: "Direction",
    accessor: "type",
    type: "text",
  },
  {
    label: "Processed By",
    accessor: "processed_by_name",
    type: "text",
  },
  {
    label: "Returned At",
    accessor: "returned_at_display",
    type: "text",
  },
];
