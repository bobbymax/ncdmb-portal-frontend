import { ColumnData } from "resources/views/components/tables/CustomDataTable";

export const inventoryIssueColumns: ColumnData[] = [
  {
    label: "Reference",
    accessor: "reference",
    type: "text",
  },
  {
    label: "Requisition",
    accessor: "requisition_code",
    type: "text",
  },
  {
    label: "Issued To",
    accessor: "issued_to_name",
    type: "text",
  },
  {
    label: "Location",
    accessor: "location_name",
    type: "text",
  },
  {
    label: "Items",
    accessor: "items_count",
    type: "text",
  },
  {
    label: "Issued At",
    accessor: "issued_at_display",
    type: "text",
  },
];
