import { ConfigProp } from "../BaseRepository";
import { BlockResponseData } from "./data";

export const blockConfig: ConfigProp<BlockResponseData> = {
  fillables: [
    "title",
    "icon",
    "data_type",
    "input_type",
    "max_words",
    "type",
    "active",
    "contents",
  ],
  associatedResources: [],
  state: {
    id: 0,
    title: "",
    icon: "",
    data_type: "paragraph",
    input_type: "ParagraphBlock",
    max_words: 0,
    type: "document",
    contents: [],
    active: 0,
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
