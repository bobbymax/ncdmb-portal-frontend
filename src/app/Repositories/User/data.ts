import { DataOptionsProps } from "resources/views/components/forms/MultiSelect";
import { BaseResponse } from "../BaseRepository";
import { RoleResponseData } from "../Role/data";
import { RemunerationResponseData } from "../Remuneration/data";
import { GradeLevelResponseData } from "../GradeLevel/data";

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
  rank: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
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
  carder_id?: number;
  grade_level?: string;
  password?: string;
  is_logged_in?: boolean;
  role: RoleResponseData | null;
  remunerations?: RemunerationResponseData[];
  groups: DataOptionsProps[];
  grade_level_object?: GradeLevelResponseData | null;
}
