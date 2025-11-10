import { ViewsProps } from "../BaseRepository";

export const inventoryTransactionViews: ViewsProps[] = [
  {
    title: "Inventory Transactions",
    server_url: "inventory-transactions",
    component: "InventoryTransactions",
    frontend_path: "/inventory/transactions",
    type: "index",
    mode: "list",
    tag: "",
  },
];
