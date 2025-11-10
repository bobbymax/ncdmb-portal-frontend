import { BaseResponse } from "../BaseRepository";

export interface InventoryTransactionResponseData extends BaseResponse {
  product_id: number;
  product_measurement_id: number | null;
  location_id: number;
  type: string;
  quantity: number;
  unit_cost: number | null;
  value: number | null;
  project_contract_id: number | null;
  store_supply_id: number | null;
  inventory_issue_id: number | null;
  inventory_return_id: number | null;
  inventory_adjustment_id: number | null;
  performed_by: number | null;
  transacted_at: string | null;
  meta?: Record<string, unknown> | null;
  product?: Record<string, unknown> | null;
  measurement?: Record<string, unknown> | null;
  location?: Record<string, unknown> | null;
  actor?: Record<string, unknown> | null;
  product_name?: string;
  location_name?: string;
  measurement_label?: string;
  actor_name?: string;
}
