import { ConfigProp } from "../BaseRepository";
import { ProductCategoryResponseData } from "./data";

export const productCategoryConfig: ConfigProp<ProductCategoryResponseData> = {
  fillables: ["name", "label", "description"],
  associatedResources: [],
  state: {
    id: 0,
    name: "",
    label: "",
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
