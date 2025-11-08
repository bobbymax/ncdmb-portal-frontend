import { BaseResponse } from "../BaseRepository";
import { ProjectResponseData } from "../Project/data";

export type BidInvitationStatus = "draft" | "published" | "closed" | "cancelled";

export interface ProjectBidInvitationResponseData extends BaseResponse {
  project_id: number;
  invitation_reference: string;
  title: string;
  description: string | null;
  technical_specifications: string | null;
  scope_of_work: string | null;
  deliverables: string | null;
  terms_and_conditions: string | null;
  required_documents: any[] | null;
  eligibility_criteria: any[] | null;
  bid_security_required: boolean;
  bid_security_amount: number | null;
  bid_security_validity_days: number;
  estimated_contract_value: number | null;
  advertisement_date: string | null;
  pre_bid_meeting_date: string | null;
  pre_bid_meeting_location: string | null;
  submission_deadline: string;
  bid_validity_days: number;
  opening_date: string;
  opening_location: string | null;
  evaluation_criteria: any[] | null;
  technical_weight: number;
  financial_weight: number;
  published_newspapers: any[] | null;
  published_bpp_portal: boolean;
  tender_document_url: string | null;
  bill_of_quantities_url: string | null;
  status: BidInvitationStatus;
  
  // Relationships
  project?: ProjectResponseData;
  bids?: any[];
  
  created_at: string;
  updated_at: string;
}

