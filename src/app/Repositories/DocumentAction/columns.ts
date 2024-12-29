import { ColumnData } from "resources/views/components/tables/CustomDataTable";

export const documentActionColumns: ColumnData[] = [
  {
    label: "Name",
    accessor: "name",
    type: "text",
  },
  {
    label: "Button Text",
    accessor: "button_text",
    type: "text",
  },
];
