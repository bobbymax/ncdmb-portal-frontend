import { BaseResponse } from "../BaseRepository";

export interface InventoryIssueItemPayload {
  requisition_item_id: number;
  product_id: number;
  product_name?: string;
  product_measurement_id: number | null;
  measurement_label?: string;
  quantity: number;
  unit_cost?: number | null;
  batch_id?: number | null;
}

export interface InventoryIssueResponseData extends BaseResponse {
  requisition_id: number;
  issued_by: number;
  issued_to: number | null;
  from_location_id: number;
  reference?: string;
  issued_at?: string;
  remarks?: string;
  items: InventoryIssueItemPayload[];
  requisition?: Record<string, unknown> | null;
  location?: Record<string, unknown> | null;
  transactions?: Record<string, unknown>[];
  requisition_code?: string;
  issued_to_name?: string;
  location_name?: string;
  items_count?: number;
  issued_at_display?: string;
}
