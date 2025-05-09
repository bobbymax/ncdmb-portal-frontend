import { BaseResponse } from "../BaseRepository";

export interface DocumentActionResponseData extends BaseResponse {
  carder_id: number;
  trigger_workflow_id: number;
  name: string;
  label: string;
  button_text: string;
  icon: string;
  variant: "primary" | "info" | "warning" | "success" | "danger" | "dark";
  draft_status: string;
  action_status:
    | "passed"
    | "failed"
    | "stalled"
    | "cancelled"
    | "complete"
    | "reversed"
    | "appeal"
    | "processing"
    | "escalate";
  state: "conditional" | "fixed";
  mode: "store" | "update" | "destroy";
  category:
    | "signature"
    | "comment"
    | "template"
    | "resource"
    | "request"
    | "upload";
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
  is_resource: number;
  is_payment: number;
  created_at?: string;
  updated_at?: string;
  disabled?: boolean;
}
