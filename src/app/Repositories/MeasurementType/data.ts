import { BaseResponse } from "../BaseRepository";

export interface MeasurementTypeResponseData extends BaseResponse {
  name: string;
  label: string;
  created_at?: string;
  updated_at?: string;
}
