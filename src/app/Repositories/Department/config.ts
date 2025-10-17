import { ConfigProp } from "../BaseRepository";
import { DepartmentResponseData } from "./data";

export const departmentConfig: ConfigProp<DepartmentResponseData> = {
  fillables: [
    "name",
    "abv",
    "bco",
    "bo",
    "director",
    "is_blocked",
    "parentId",
    "type",
    "signatory_staff_id",
    "alternate_signatory_staff_id",
  ],
  associatedResources: [
    { name: "departments", url: "departments" },
    { name: "users", url: "users" },
  ],
  state: {
    id: 0,
    name: "",
    abv: "",
    bo: 0,
    bco: 0,
    director: 0,
    type: "department",
    parentId: 0,
    is_blocked: 0,
    signatory_staff_id: 0,
    alternate_signatory_staff_id: 0,
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
