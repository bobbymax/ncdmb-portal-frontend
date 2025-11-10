import { ColumnData } from "resources/views/components/tables/CustomDataTable";

export const inventoryBalanceColumns: ColumnData[] = [
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
    label: "On Hand",
    accessor: "on_hand",
    type: "text",
  },
  {
    label: "Reserved",
    accessor: "reserved",
    type: "text",
  },
  {
    label: "Available",
    accessor: "available",
    type: "text",
  },
  {
    label: "Unit Cost",
    accessor: "unit_cost",
    type: "text",
  },
  {
    label: "Last Movement",
    accessor: "last_movement",
    type: "text",
  },
];
