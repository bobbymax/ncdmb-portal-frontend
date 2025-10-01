import { ConfigProp } from "../BaseRepository";
import { SettingResponseData } from "./data";

export const settingConfig: ConfigProp<SettingResponseData> = {
  fillables: [
    "key",
    "name",
    "value",
    "details",
    "input_type",
    "input_data_type",
    "access_group",
    "order",
    "is_disabled",
    "configuration",
    "layout",
  ],
  associatedResources: [],
  state: {
    id: 0,
    key: "",
    name: "",
    value: "",
    details: "",
    input_type: "text",
    input_data_type: "string",
    access_group: "public",
    order: 0,
    is_disabled: 0,
    configuration: {},
    layout: 12,
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
