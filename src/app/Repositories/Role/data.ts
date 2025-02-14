import { BaseResponse } from "../BaseRepository";

export interface RoleResponseData extends BaseResponse {
  department_id: number;
  name: string;
  slots: number;
  access_level:
    | "basic"
    | "operative"
    | "control"
    | "command"
    | "sovereign"
    | "system";
  created_at?: string;
  updated_at?: string;
}
