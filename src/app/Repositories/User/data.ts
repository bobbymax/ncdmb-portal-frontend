import { BaseResponse } from "../BaseRepository";
import { AuthPageResponseData } from "../Page/data";
// import { RoleResponseData } from "../RoleRepository";

export interface UserResponseData extends BaseResponse {
  name: string;
  email: string;
  password?: string;
  staff_no: string;
  is_logged_in?: boolean;
  roles?: object[];
  pages: AuthPageResponseData[];
  default_page_id: number;
}
