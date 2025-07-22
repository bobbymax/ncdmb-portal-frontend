import { BaseResponse } from "../BaseRepository";

export type ResourceFoundation = "staff" | "third-party";

export interface ProjectResponseData extends BaseResponse {
  user_id: number;
  department_id: number;
  threshold_id: number;
  project_category_id: number;
  code: string;
  title: string;
  slug?: string;
  description: string;
  total_proposed_amount: number;
  total_approved_amount: number;
  variation_amount: number;
  sub_total_amount: number;
  vat_amount: number;
  markup_amount: number;
  approved_start_date: string;
  approved_end_date: string;
  actual_end_date: string;
  proposed_start_date: string;
  proposed_end_date: string;
  type: ResourceFoundation;
  service_charge_percentage: number;
  status:
    | "pending"
    | "registered"
    | "approved"
    | "denied"
    | "kiv"
    | "discussed";
  created_at?: string;
  updated_at?: string;
}
