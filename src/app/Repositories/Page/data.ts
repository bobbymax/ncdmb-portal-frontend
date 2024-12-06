import { DataOptionsProps } from "resources/views/components/forms/MultiSelect";
import { BaseResponse } from "../BaseRepository";

export interface AuthPageResponseData extends BaseResponse {
  icon: string;
  is_default: boolean;
  is_menu: boolean;
  label: string;
  path: string;
  name: string;
  parent_id: number;
  type: "app" | "index" | "view" | "form" | "external" | "dashboard" | "report";
  roles?: DataOptionsProps[];
  created_at?: string;
  updated_at?: string;
}
