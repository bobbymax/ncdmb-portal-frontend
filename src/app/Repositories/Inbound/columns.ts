import { ColumnData } from "resources/views/components/tables/CustomDataTable";

export const inboundColumns: ColumnData[] = [
  { label: "Sender", accessor: "from_name", type: "text" },
  { label: "Sender Email", accessor: "from_email", type: "text" },
  { label: "Reference Number", accessor: "ref_no", type: "text" },
  { label: "Priority", accessor: "priority", type: "text" },
  { label: "Channel", accessor: "channel", type: "text" },
  { label: "Status", accessor: "status", type: "text" },
];
