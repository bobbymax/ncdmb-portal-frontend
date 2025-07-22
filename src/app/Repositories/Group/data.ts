import { DataOptionsProps } from "resources/views/components/forms/MultiSelect";
import { BaseResponse } from "../BaseRepository";

export interface GroupResponseData extends BaseResponse {
  name: string;
  label: string;
  carderIds?: number[];
  users?: DataOptionsProps[];
  created_at?: string;
  updated_at?: string;
}
