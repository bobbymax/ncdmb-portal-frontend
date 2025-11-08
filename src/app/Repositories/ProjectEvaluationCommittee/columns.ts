import { ColumnData } from "resources/views/components/tables/CustomDataTable";

export const projectEvaluationCommitteeColumns: ColumnData[] = [
  {
    label: "Committee Name",
    accessor: "committee_name",
    type: "text",
  },
  {
    label: "Type",
    accessor: "committee_type",
    type: "text",
  },
  {
    label: "Chairman",
    accessor: "chairman.name",
    type: "text",
  },
  {
    label: "Members Count",
    accessor: "members",
    type: "text",
  },
  {
    label: "Formed Date",
    accessor: "formed_at",
    type: "date",
  },
  {
    label: "Status",
    accessor: "status",
    type: "badge",
  },
];

