import { BaseResponse } from "../BaseRepository";

export interface InventoryAdjustmentLinePayload {
  product_id: number;
  product_measurement_id: number | null;
  quantity: number;
  direction: "plus" | "minus";
  unit_cost?: number | null;
  product_name?: string;
  measurement_label?: string;
}

export interface InventoryAdjustmentResponseData extends BaseResponse {
  location_id: number;
  performed_by: number;
  reason: "cycle_count" | "damage" | "shrinkage" | "rebalance" | "other";
  notes: string | null;
  adjusted_at: string | null;
  lines: InventoryAdjustmentLinePayload[];
  location_name?: string;
  actor_name?: string;
  lines_count?: number;
  adjusted_at_display?: string;
}
