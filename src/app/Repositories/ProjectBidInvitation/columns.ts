import { ColumnData } from "resources/views/components/tables/CustomDataTable";

export const projectBidInvitationColumns: ColumnData[] = [
  {
    label: "Reference",
    accessor: "invitation_reference",
    type: "text",
  },
  {
    label: "Title",
    accessor: "title",
    type: "text",
  },
  {
    label: "Submission Deadline",
    accessor: "submission_deadline",
    type: "date",
  },
  {
    label: "Opening Date",
    accessor: "opening_date",
    type: "date",
  },
  {
    label: "Estimated Value",
    accessor: "estimated_contract_value",
    type: "currency",
  },
  {
    label: "Status",
    accessor: "status",
    type: "badge",
  },
];

