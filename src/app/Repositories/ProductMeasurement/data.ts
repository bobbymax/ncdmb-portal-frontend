import { BaseResponse } from "../BaseRepository";

export interface ProductMeasurementResponseData extends BaseResponse {
  product_id: number;
  measurement_type_id: number;
  quantity: number;
  created_at?: string;
  updated_at?: string;
}
