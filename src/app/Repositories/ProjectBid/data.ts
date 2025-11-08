import { BaseResponse } from "../BaseRepository";

export type BidStatus =
  | "submitted"
  | "opened"
  | "responsive"
  | "non_responsive"
  | "under_evaluation"
  | "evaluated"
  | "disqualified"
  | "recommended"
  | "awarded"
  | "not_awarded";

export type SubmissionMethod = "physical" | "electronic" | "hybrid";
export type BidSecurityType = "bank_guarantee" | "insurance_bond" | "cash";
export type TechnicalStatus = "pending" | "passed" | "failed";

export interface ProjectBidResponseData extends BaseResponse {
  project_id: number;
  bid_invitation_id: number;
  vendor_id: number;
  bid_reference: string;
  bid_amount: number;
  bid_currency: string;
  submitted_at: string | null;
  submission_method: SubmissionMethod;
  received_by: number | null;
  bid_security_submitted: boolean;
  bid_security_type: BidSecurityType | null;
  bid_security_reference: string | null;
  opened_at: string | null;
  opened_by: number | null;
  is_administratively_compliant: boolean | null;
  administrative_notes: string | null;
  technical_score: number | null;
  technical_status: TechnicalStatus | null;
  technical_notes: string | null;
  financial_score: number | null;
  is_financially_responsive: boolean | null;
  financial_notes: string | null;
  combined_score: number | null;
  ranking: number | null;
  status: BidStatus;
  disqualification_reason: string | null;
  bid_documents: any[] | null;
  
  // Relationships
  vendor?: any;
  project?: any;
  bid_invitation?: any;
  
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

