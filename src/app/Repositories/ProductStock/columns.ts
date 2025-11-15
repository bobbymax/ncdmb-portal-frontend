import { ColumnData } from "resources/views/components/tables/CustomDataTable";

export const productStockColumns: ColumnData[] = [
  { label: "Product", accessor: "product_name", type: "text" },
  {
    label: "Opening Stock Balance",
    accessor: "opening_stock_balance",
    type: "text",
  },
  {
    label: "Closing Stock Balance",
    accessor: "closing_stock_balance",
    type: "text",
  },
  { label: "Out of Stock", accessor: "out_of_stock", type: "bool" },
  { label: "Store Supply", accessor: "store_supply_name", type: "text" },
  { label: "End of Life", accessor: "end_of_life", type: "text" },
  { label: "Stock In", accessor: "stock_in", type: "text" },
  { label: "Stock Out", accessor: "stock_out", type: "text" },
];
