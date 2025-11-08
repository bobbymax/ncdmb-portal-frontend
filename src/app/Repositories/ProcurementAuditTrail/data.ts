import { BaseResponse } from "../BaseRepository";

export interface ProcurementAuditTrailResponseData extends BaseResponse {
  project_id: number;
  user_id: number;
  action: string;
  entity_type: string | null;
  entity_id: number | null;
  before_value: any | null;
  after_value: any | null;
  ip_address: string | null;
  user_agent: string | null;
  notes: string | null;
  
  // Relationships
  project?: any;
  user?: any;
  
  created_at: string;
}

