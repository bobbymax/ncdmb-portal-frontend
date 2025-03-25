import { BaseResponse } from "../BaseRepository";

export interface GroupResponseData extends BaseResponse {
  name: string;
  label: string;
  carderIds?: number[];
  created_at?: string;
  updated_at?: string;
}
