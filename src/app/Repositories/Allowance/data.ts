import { PlacementType } from "app/Hooks/useClaimCalculator";
import { BaseResponse } from "../BaseRepository";
import { RemunerationResponseData } from "../Remuneration/data";
import { ResponseSubmitData } from "resources/views/crud/Allowance";

export type ComponentEnumValues =
  | "flight-resident"
  | "flight-non-resident"
  | "road-resident"
  | "road-non-resident"
  | "both-resident"
  | "both-non-resident"
  | "not-applicable"
  | "road-both"
  | "flight-both"
  | "both-both";

export interface AllowanceResponseData extends BaseResponse {
  name: string;
  label?: string;
  parent_id: number;
  departure_city_id: number;
  destination_city_id: number;
  days_required: number;
  is_active: number;
  description: string;
  category: "parent" | "item";
  payment_route: "one-off" | "round-trip" | "computable";
  payment_basis: "weekdays" | "days" | "nights" | "fixed" | "km";
  remunerations: RemunerationResponseData[];
  selectedRemunerations: ResponseSubmitData[];
  component: ComponentEnumValues;
  placement?: PlacementType;
  meta?: {
    start_date: string;
    end_date: string;
    num_of_days: number;
  };
  created_at?: string;
  updated_at?: string;
}
