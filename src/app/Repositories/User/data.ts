import { DataOptionsProps } from "resources/views/components/forms/MultiSelect";
import { BaseResponse } from "../BaseRepository";
import { RoleResponseData } from "../Role/data";

export interface UserResponseData extends BaseResponse {
  staff_no: string;
  name?: string;
  firstname: string;
  middlename: string;
  surname: string;
  role_id: number;
  grade_level_id: number;
  department_id: number;
  default_page_id: number;
  location_id: number;
  avatar: string;
  gender: "male" | "female";
  date_joined: string;
  job_title: string;
  is_admin: number;
  blocked: number;
  type: "permanent" | "contract" | "adhoc" | "secondment" | "support" | "admin";
  status:
    | "available"
    | "official-assignment"
    | "training"
    | "leave"
    | "study"
    | "secondment"
    | "other";
  email: string;
  password?: string;
  is_logged_in?: boolean;
  role: RoleResponseData | null;
  groups: DataOptionsProps[];
}
