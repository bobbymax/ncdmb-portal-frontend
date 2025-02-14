import { BaseResponse } from "../BaseRepository";

export interface LocationResponseData extends BaseResponse {
  city_id: number;
  name: string;
  address: string;
  is_closed: number;
  created_at?: string;
  updated_at?: string;
}
