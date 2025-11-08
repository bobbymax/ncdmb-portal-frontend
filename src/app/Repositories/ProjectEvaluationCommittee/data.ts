import { BaseResponse } from "../BaseRepository";

export type CommitteeType = "tender_board" | "technical" | "financial" | "opening";
export type CommitteeStatus = "active" | "dissolved";

export interface CommitteeMember {
  user_id: number;
  role: "chairman" | "secretary" | "member" | "observer";
}

export interface ProjectEvaluationCommitteeResponseData extends BaseResponse {
  project_id: number;
  committee_name: string;
  committee_type: CommitteeType;
  chairman_id: number;
  members: CommitteeMember[] | null;
  status: CommitteeStatus;
  formed_at: string | null;
  dissolved_at: string | null;
  
  // Relationships
  project?: any;
  chairman?: any;
  
  created_at: string;
  updated_at: string;
}

