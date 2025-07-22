import { BaseResponse } from "../BaseRepository";

export interface ThresholdResponseData extends BaseResponse {
  name: string;
  amount: string;
  type: "WO" | "TB" | "GC" | "FEC" | "OTHER";
  created_at?: string;
  updated_at?: string;
}
