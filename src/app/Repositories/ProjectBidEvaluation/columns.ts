import { ColumnData } from "resources/views/components/tables/CustomDataTable";

export const projectBidEvaluationColumns: ColumnData[] = [
  {
    label: "Bid Reference",
    accessor: "project_bid.bid_reference",
    type: "text",
  },
  {
    label: "Evaluator",
    accessor: "evaluator.name",
    type: "text",
  },
  {
    label: "Type",
    accessor: "evaluation_type",
    type: "text",
  },
  {
    label: "Date",
    accessor: "evaluation_date",
    type: "date",
  },
  {
    label: "Score",
    accessor: "total_score",
    type: "text",
  },
  {
    label: "Result",
    accessor: "pass_fail",
    type: "badge",
  },
  {
    label: "Status",
    accessor: "status",
    type: "badge",
  },
];

