import { ViewsProps } from "../BaseRepository";

export const inventoryBalanceViews: ViewsProps[] = [
  {
    title: "Inventory Balances",
    server_url: "inventory-balances",
    component: "InventoryBalances",
    frontend_path: "/inventory/balances",
    type: "index",
    mode: "list",
    tag: "",
  },
];
