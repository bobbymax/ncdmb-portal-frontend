import { BaseResponse } from "../BaseRepository";

export interface ProductStockResponseData extends BaseResponse {
  product_id: number;
  opening_stock_balance: number;
  closing_stock_balance: number;
  out_of_stock: boolean;
  store_supply_id: number;
  end_of_life: string;
  stock_in: "purchase" | "transfer" | "production" | "allocation";
  stock_out: "sales" | "consumption" | "waste" | "distribution";
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}
