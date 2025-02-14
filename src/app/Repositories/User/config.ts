import { ConfigProp } from "../BaseRepository";
import { UserResponseData } from "./data";

export const userConfig: ConfigProp<UserResponseData> = {
  fillables: [
    "email",
    "staff_no",
    "department_id",
    "grade_level_id",
    "location_id",
    "role_id",
    "firstname",
    "middlename",
    "surname",
    "avatar",
    "gender",
    "date_joined",
    "job_title",
    "status",
    "groups",
    "type",
    "blocked",
    "default_page_id",
  ],
  associatedResources: [
    { name: "roles", url: "roles" },
    { name: "pages", url: "pages" },
    { name: "groups", url: "groups" },
    { name: "departments", url: "departments" },
    { name: "gradeLevels", url: "gradeLevels" },
    { name: "locations", url: "locations" },
  ],
  state: {
    id: 0,
    department_id: 0,
    grade_level_id: 0,
    location_id: 0,
    default_page_id: 0,
    role_id: 0,
    staff_no: "",
    firstname: "",
    middlename: "",
    surname: "",
    avatar: "",
    gender: "male",
    date_joined: "",
    job_title: "",
    status: "available",
    email: "",
    role: null,
    is_admin: 0,
    groups: [],
    blocked: 0,
    type: "permanent",
  },
  actions: [
    {
      label: "manage",
      icon: "ri-settings-3-line",
      variant: "success",
      conditions: [],
      operator: "and",
      display: "Manage",
    },
  ],
};
