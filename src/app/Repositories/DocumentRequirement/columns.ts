import { ColumnData } from "resources/views/components/tables/CustomDataTable";

export const documentRequirementColumns: ColumnData[] = [
  {
    label: "Name",
    accessor: "name",
    type: "text",
  },
  {
    label: "Priority",
    accessor: "priority",
    type: "text",
  },
];
