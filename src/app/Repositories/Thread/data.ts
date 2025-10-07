import { BaseResponse } from "../BaseRepository";
import {
  PointerActivityTypesProps,
  PointerThreadConversationProps,
} from "../DocumentCategory/data";

export interface ThreadResponseData extends BaseResponse {
  pointer_identifier: string;
  document_id?: number;
  resource?: unknown;
  identifier: string;
  icon?: string;
  thread_owner_id: number; // logged in user id
  recipient_id: number;
  action?: string;
  category: PointerActivityTypesProps;
  conversations: PointerThreadConversationProps[];
  priority: "low" | "medium" | "high";
  status: "pending" | "resolved" | "rejected";
  state: "open" | "closed";
  created_at: string;
  updated_at?: string;
}
