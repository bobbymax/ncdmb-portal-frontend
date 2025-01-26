import { ColumnData } from "resources/views/components/tables/CustomDataTable";

export const documentActionColumns: ColumnData[] = [
  {
    label: "Button Text",
    accessor: "button_text",
    type: "text",
  },
  {
    label: "Variant",
    accessor: "variant",
    type: "text",
  },
  {
    label: "Mode",
    accessor: "mode",
    type: "text",
  },
];
