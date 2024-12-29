import { ColumnData } from "resources/views/components/tables/CustomDataTable";

export const documentCategoryColumns: ColumnData[] = [
  {
    label: "Name",
    accessor: "name",
    type: "text",
  },
  {
    label: "Document Type",
    accessor: "document_type",
    type: "text",
  },
];
