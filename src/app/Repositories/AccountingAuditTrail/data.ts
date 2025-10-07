import { BaseResponse } from "../BaseRepository";

export type AuditAction =
  | "create"
  | "update"
  | "post"
  | "reverse"
  | "reconcile"
  | "approve"
  | "reject"
  | "settle"
  | "close";

export interface AccountingAuditTrailResponseData extends BaseResponse {
  user_id: number;
  action: AuditAction;
  auditable_type: string;
  auditable_id: number;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  reason?: string;
  ip_address?: string;
  user_agent?: string;
  created_at?: string;
  updated_at?: string;
}
