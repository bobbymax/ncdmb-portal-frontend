import { BaseResponse } from "../BaseRepository";

export interface CityResponseData extends BaseResponse {
  allowance_id: number;
  is_capital: number;
  has_airport: number;
  name: string;
  label?: string;
  created_at?: string;
  updated_at?: string;
}
