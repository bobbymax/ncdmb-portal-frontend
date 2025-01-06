import { ConfigProp } from "../BaseRepository";
import { StageCategoryResponseData } from "./data";

export const stageCategoryConfig: ConfigProp<StageCategoryResponseData> = {
  fillables: ["name", "icon_path_blob", "description"],
  associatedResources: [],
  state: {
    id: 0,
    name: "",
    icon_path: "",
    icon_path_blob: null,
    description: "",
    actions: [],
    label: "",
    upload: null,
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
