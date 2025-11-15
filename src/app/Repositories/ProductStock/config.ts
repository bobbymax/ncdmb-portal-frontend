import { ConfigProp } from "../BaseRepository";
import { ProductStockResponseData } from "./data";

export const productStockConfig: ConfigProp<ProductStockResponseData> = {
  fillables: [
    "product_id",
    "opening_stock_balance",
    "closing_stock_balance",
    "out_of_stock",
    "store_supply_id",
    "end_of_life",
    "stock_in",
    "stock_out",
    "is_active",
  ],
  associatedResources: [
    { name: "products", url: "products" },
    // {name: "storeSupplies", url: "storeSupplies"},
  ],
  state: {
    id: 0,
    product_id: 0,
    opening_stock_balance: 0,
    closing_stock_balance: 0,
    out_of_stock: false,
    store_supply_id: 0,
    end_of_life: "",
    stock_in: "purchase",
    stock_out: "sales",
    is_active: true,
  },
  actions: [
    {
      label: "manage",
      icon: "ri-settings-3-line",
      variant: "success",
      conditions: [],
      operator: "and",
      display: "Manage",
    },
  ],
};
