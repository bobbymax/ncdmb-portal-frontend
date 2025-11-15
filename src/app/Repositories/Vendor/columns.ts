import { ColumnData } from "resources/views/components/tables/CustomDataTable";

export const vendorColumns: ColumnData[] = [
  { label: "Name", accessor: "name", type: "text" },
  { label: "Phone", accessor: "phone", type: "text" },
  { label: "Email", accessor: "email", type: "text" },
  { label: "Reg No", accessor: "reg_no", type: "text" },
  { label: "TIN Number", accessor: "tin_number", type: "text" },
];
