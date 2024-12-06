import { BaseResponse } from "../BaseRepository";

export interface GroupResponseData extends BaseResponse {
  name: string;
  created_at?: string;
  updated_at?: string;
}
