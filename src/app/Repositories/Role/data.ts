import { BaseResponse } from "../BaseRepository";

export interface RoleResponseData extends BaseResponse {
  department_id: number;
  name: string;
  slots: number;
  created_at?: string;
  updated_at?: string;
}
