import { ColumnData } from "resources/views/components/tables/CustomDataTable";

export const entityColumns: ColumnData[] = [
  { label: "Name", accessor: "name", type: "text" },
  { label: "Abv", accessor: "acronym", type: "text" },
  { label: "Type", accessor: "type", type: "text" },
];
