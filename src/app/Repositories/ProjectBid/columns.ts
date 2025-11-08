import { ColumnData } from "resources/views/components/tables/CustomDataTable";

export const projectBidColumns: ColumnData[] = [
  {
    label: "Bid Reference",
    accessor: "bid_reference",
    type: "text",
  },
  {
    label: "Vendor",
    accessor: "vendor.name",
    type: "text",
  },
  {
    label: "Bid Amount",
    accessor: "bid_amount",
    type: "currency",
  },
  {
    label: "Submitted",
    accessor: "submitted_at",
    type: "date",
  },
  {
    label: "Technical Score",
    accessor: "technical_score",
    type: "text",
  },
  {
    label: "Financial Score",
    accessor: "financial_score",
    type: "text",
  },
  {
    label: "Ranking",
    accessor: "ranking",
    type: "text",
  },
  {
    label: "Status",
    accessor: "status",
    type: "badge",
  },
];

