import { ConfigProp } from "../BaseRepository";
import { FileTemplateResponseData } from "./data";

export const fileTemplateConfig: ConfigProp<FileTemplateResponseData> = {
  fillables: [
    "name",
    "service",
    "component",
    "tagline",
    "repository",
    "response_data_format",
  ],
  associatedResources: [],
  state: {
    id: 0,
    name: "",
    service: "",
    component: "",
    tagline: "",
    repository: "",
    response_data_format: "",
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
    // {
    //   label: "builder",
    //   icon: "ri-tools-line",
    //   variant: "dark",
    //   conditions: [],
    //   operator: "and",
    //   display: "Builder",
    // },
  ],
};
