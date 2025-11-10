import { ColumnData } from "resources/views/components/tables/CustomDataTable";

export const inventoryAdjustmentColumns: ColumnData[] = [
  {
    label: "Location",
    accessor: "location_name",
    type: "text",
  },
  {
    label: "Reason",
    accessor: "reason",
    type: "text",
  },
  {
    label: "Lines",
    accessor: "lines_count",
    type: "text",
  },
  {
    label: "Performed By",
    accessor: "actor_name",
    type: "text",
  },
  {
    label: "Adjusted At",
    accessor: "adjusted_at_display",
    type: "text",
  },
];
