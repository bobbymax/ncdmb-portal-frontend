import { BaseResponse } from "../BaseRepository";
import { UploadResponseData } from "../Document/data";
import { InboundAnalysisResult } from "../../Services/AIService";
import { InboundInstructionResponseData } from "../InboundInstruction/data";

export interface InboundResponseData extends BaseResponse {
  received_by_id: number;
  authorising_officer_id: number;
  department_id: number;
  vendor_id: number;
  from_name: string;
  from_email: string;
  from_phone: string;
  ref_no: string;
  summary: string;
  instructions: InboundInstructionResponseData[];
  analysis: InboundAnalysisResult | unknown;
  mailed_at: string;
  received_at: string;
  published_at: string;
  assignable_id: number;
  assignable_type: string;
  security_class: "public" | "internal" | "confidential" | "secret";
  channel: "hand_delivery" | "email" | "courier" | "post" | "other";
  priority: "low" | "medium" | "high";
  status: "pending" | "open" | "closed";
  file_uploads: string[];
  uploads?: UploadResponseData[];
  ocr_available: boolean;
  ocr_index_version: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}
