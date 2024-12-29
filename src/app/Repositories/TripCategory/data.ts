import { DataOptionsProps } from "resources/views/components/forms/MultiSelect";
import { AllowanceResponseData } from "../Allowance/data";
import { BaseResponse } from "../BaseRepository";

export interface TripCategoryResponseData extends BaseResponse {
  name: string;
  label: string;
  description: string;
  type: "flight" | "road";
  accommodation_type: "non-residence" | "residence";
  allowances: AllowanceResponseData[];
  selectedAllowances: DataOptionsProps[];
  created_at?: string;
  updated_at?: string;
}
