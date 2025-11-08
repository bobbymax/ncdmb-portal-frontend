import { BaseResponse } from "../BaseRepository";

export type EvaluationType = "administrative" | "technical" | "financial" | "post_qualification";
export type PassFail = "pass" | "fail" | "conditional";
export type EvaluationStatus = "draft" | "submitted" | "reviewed" | "approved";

export interface ProjectBidEvaluationResponseData extends BaseResponse {
  project_bid_id: number;
  evaluator_id: number;
  evaluation_type: EvaluationType;
  evaluation_date: string;
  criteria: any[] | null;
  total_score: number | null;
  pass_fail: PassFail | null;
  comments: string | null;
  recommendations: string | null;
  status: EvaluationStatus;
  
  // Relationships
  project_bid?: any;
  evaluator?: any;
  
  created_at: string;
  updated_at: string;
}

