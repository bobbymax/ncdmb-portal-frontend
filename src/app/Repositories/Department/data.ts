import { BaseResponse } from "../BaseRepository";

export interface DepartmentResponseData extends BaseResponse {
  name: string;
  abv: string;
  parentId: number;
  type: "directorate" | "division" | "department" | "unit";
  bco: number;
  bo: number;
  director: number;
  signatory_staff_id: number;
  alternate_signatory_staff_id: number;
  is_soverign?: boolean;
  is_blocked: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}
