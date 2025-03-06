import { ColumnData } from "resources/views/components/tables/CustomDataTable";

export const documentActionColumns: ColumnData[] = [
  {
    label: "Button Text",
    accessor: "button_text",
    type: "text",
  },
  {
    label: "Status",
    accessor: "draft_status",
    type: "text",
  },
  {
    label: "Resource Type",
    accessor: "resource_type",
    type: "text",
  },
];
