import { BaseResponse } from "../BaseRepository";
import { GroupResponseData } from "../Group/data";

export interface LedgerResponseData extends BaseResponse {
  code: "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K";
  name: string;
  description: string;
  groups: GroupResponseData[];
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}
