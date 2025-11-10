import { ColumnData } from "resources/views/components/tables/CustomDataTable";

export const inventoryTransactionColumns: ColumnData[] = [
  {
    label: "Timestamp",
    accessor: "transacted_at",
    type: "text",
  },
  {
    label: "Product",
    accessor: "product_name",
    type: "text",
  },
  {
    label: "Measurement",
    accessor: "measurement_label",
    type: "text",
  },
  {
    label: "Location",
    accessor: "location_name",
    type: "text",
  },
  {
    label: "Movement",
    accessor: "type",
    type: "text",
  },
  {
    label: "Quantity",
    accessor: "quantity",
    type: "text",
  },
  {
    label: "Unit Cost",
    accessor: "unit_cost",
    type: "text",
  },
  {
    label: "Value",
    accessor: "value",
    type: "text",
  },
  {
    label: "Processed By",
    accessor: "actor_name",
    type: "text",
  },
];
