import { BaseResponse } from "../BaseRepository";

export interface InboundInstructionResponseData extends BaseResponse {
  inbound_id: number;
  created_by_id: number;
  instruction_type:
    | "review"
    | "respond"
    | "forward"
    | "approve"
    | "archive"
    | "other";
  instruction_text: string;
  notes: unknown;
  assignable_id: number;
  assignable_type: string;
  category: "user" | "department" | "group";
  status: "pending" | "in_progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  due_date: string;
  completed_at: string;
  started_at: string;
  completion_notes: string;
  completed_by_id: number | null;
  created_at?: string;
  updated_at?: string;
}
