import { BaseResponse } from "../BaseRepository";

export interface InventoryReturnResponseData extends BaseResponse {
  inventory_issue_id: number | null;
  store_supply_id: number | null;
  location_id: number;
  type: "to_supplier" | "from_project" | "internal";
  returned_at: string | null;
  reason: string | null;
  product_id: number;
  product_measurement_id: number | null;
  quantity: number;
  unit_cost: number | null;
  product_name?: string;
  measurement_label?: string;
  location_name?: string;
  reference?: string;
  processed_by_name?: string;
  returned_at_display?: string;
}
