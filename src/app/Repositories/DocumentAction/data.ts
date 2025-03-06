import { BaseResponse } from "../BaseRepository";

export interface DocumentActionResponseData extends BaseResponse {
  carder_id: number;
  name: string;
  label: string;
  button_text: string;
  icon: string;
  variant: "primary" | "info" | "warning" | "success" | "danger" | "dark";
  draft_status: string;
  action_status: "passed" | "failed" | "stalled" | "cancelled" | "complete";
  state: "conditional" | "fixed";
  mode: "store" | "update" | "destroy";
  category: "signature" | "comment" | "template" | "resource" | "request";
  resource_type:
    | "searchable"
    | "classified"
    | "private"
    | "archived"
    | "computed"
    | "generated"
    | "report"
    | "other";
  has_update: number;
  component: string;
  description: string;
  created_at?: string;
  updated_at?: string;
  disabled?: boolean;
}
