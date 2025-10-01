import { DataOptionsProps } from "@/resources/views/components/forms/MultiSelect";
import { BaseResponse } from "../BaseRepository";

export type SettingInputType =
  | "text"
  | "number"
  | "email"
  | "password"
  | "date"
  | "checkbox"
  | "radio"
  | "select"
  | "textarea"
  | "file"
  | "multi-select";

export type SettingInputDataType =
  | "string"
  | "number"
  | "boolean"
  | "object"
  | "array";

export type SettingAccessGroup = "public" | "admin";
export type GridLayout = 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type ConfigurationProps = {
  options?: DataOptionsProps[];
};

export interface SettingResponseData extends BaseResponse {
  key: string;
  name: string;
  value: string;
  details: string;
  configuration: ConfigurationProps;
  input_type: SettingInputType;
  input_data_type: SettingInputDataType;
  access_group: SettingAccessGroup;
  layout: GridLayout;
  order: number;
  is_disabled: number;
  created_at?: string;
  updated_at?: string;
}
