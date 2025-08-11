import { DataOptionsProps } from "resources/views/components/forms/MultiSelect";
import { BaseResponse } from "../BaseRepository";

export interface GroupResponseData extends BaseResponse {
  name: string;
  label: string;
  rank: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
  scope:
    | "directorate"
    | "division"
    | "department"
    | "board"
    | "collaborations"
    | "personal";
  carderIds?: number[];
  users?: DataOptionsProps[];
  created_at?: string;
  updated_at?: string;
}
