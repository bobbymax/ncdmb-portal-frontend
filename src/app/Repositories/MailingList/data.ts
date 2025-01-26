import { BaseResponse } from "../BaseRepository";
import { DepartmentResponseData } from "../Department/data";
import { GroupResponseData } from "../Group/data";

export interface MailingListResponseData extends BaseResponse {
  group_id: number;
  department_id: number;
  name: string;
  group_name?: string;
  department_name?: string;
  group?: Partial<GroupResponseData> | null;
  department?: Partial<DepartmentResponseData> | null;
  created_at?: string;
  updated_at?: string;
}
