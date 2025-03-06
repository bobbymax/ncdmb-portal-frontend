import { BaseResponse } from "../BaseRepository";

type ThreadsProp = {
  document_update_id: number;
  staff: string;
  user_id: number;
  department: string;
  response: string;
  responded_at: string;
};

type DocumentUpdateUser = {
  name: string;
  staff_no: string;
  department: string;
  role: string;
  avatar: string;
};

type MetaUpdate = {
  document_type_name: string;
  current_stage: string;
  document_action_name: string;
};

export interface DocumentUpdateResponseData extends BaseResponse {
  document_draft_id: number;
  user_id: number;
  document_action_id: number;
  threads: ThreadsProp[];
  comment: string;
  status: "pending" | "responded";
  user?: DocumentUpdateUser;
  meta?: MetaUpdate;
  created_at?: string;
  updated_at?: string;
}
