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
  ],
  associatedResources: [{ name: "departments", url: "departments" }],
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
