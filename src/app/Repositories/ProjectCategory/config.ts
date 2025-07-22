import { ConfigProp } from "../BaseRepository";
import { ProjectCategoryResponseData } from "./data";

export const projectCategoryConfig: ConfigProp<ProjectCategoryResponseData> = {
  fillables: ["name", "description"],
  associatedResources: [],
  state: {
    id: 0,
    name: "",
    description: "",
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
