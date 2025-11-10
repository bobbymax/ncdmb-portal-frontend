import { BaseResponse } from "../BaseRepository";

export interface InventoryLocationResponseData extends BaseResponse {
  name: string;
  code: string;
  type: "warehouse" | "site" | "vehicle" | "office";
  department_id: number | null;
  parent_id: number | null;
  created_at?: string;
  updated_at?: string;
  department?: { name?: string } | null;
  parent?: { name?: string } | null;
  department_name?: string;
  parent_name?: string;
  created_at_display?: string;
}
