import { BaseResponse } from "../BaseRepository";

export interface GradeLevelResponseData extends BaseResponse {
  name: string;
  key: string;
  type: "system" | "board";
  created_at?: string;
  updated_at?: string;
}
