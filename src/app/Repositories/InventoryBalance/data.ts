import { BaseResponse } from "../BaseRepository";

export interface InventoryBalanceResponseData extends BaseResponse {
  product_id: number;
  product_measurement_id: number | null;
  location_id: number;
  on_hand: number;
  reserved: number;
  available: number;
  unit_cost: number;
  last_movement_at?: string | null;
  product?: Record<string, unknown> | null;
  measurement?: Record<string, unknown> | null;
  location?: Record<string, unknown> | null;
  product_name?: string;
  measurement_label?: string;
  location_name?: string;
  last_movement?: string;
  created_at?: string;
  updated_at?: string;
}
