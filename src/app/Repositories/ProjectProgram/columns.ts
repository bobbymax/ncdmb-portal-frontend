import { ColumnData } from "resources/views/components/tables/CustomDataTable";

export const projectProgramColumns: ColumnData[] = [
  {
    label: "Code",
    accessor: "code",
    type: "text",
  },
  {
    label: "Title",
    accessor: "title",
    type: "text",
  },
  {
    label: "Status",
    accessor: "status",
    type: "status",
  },
  {
    label: "Priority",
    accessor: "priority",
    type: "status",
  },
  {
    label: "Phases",
    accessor: "total_phases",
    type: "text",
  },
  {
    label: "Total Amount",
    accessor: "total_estimated_amount",
    type: "currency",
  },
  {
    label: "Progress (%)",
    accessor: "overall_progress_percentage",
    type: "text",
  },
  {
    label: "Health",
    accessor: "overall_health",
    type: "status",
  },
];

