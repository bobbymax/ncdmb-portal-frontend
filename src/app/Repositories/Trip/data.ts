import { BaseResponse } from "../BaseRepository";
import { TripCategoryResponseData } from "../TripCategory/data";

export interface TripResponseData extends BaseResponse {
  claim_id: number;
  airport_id: number;
  departure_city_id: number;
  destination_city_id: number;
  per_diem_category_id: number;
  trip_category_id: number;
  purpose: string;
  distance: number;
  route: "one-way" | "return";
  departure_date: string;
  return_date: string;
  total_amount_spent: number;
  category: TripCategoryResponseData | null;
  created_at?: string;
  updated_at?: string;
}
