import { ColumnData } from "resources/views/components/tables/CustomDataTable";

export const productMeasurementColumns: ColumnData[] = [
  { label: "Product", accessor: "product.name", type: "text" },
  { label: "Measurement Type", accessor: "measurement.name", type: "text" },
  { label: "Quantity", accessor: "quantity", type: "text" },
];
