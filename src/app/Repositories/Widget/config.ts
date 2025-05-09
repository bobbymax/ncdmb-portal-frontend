import { ConfigProp } from "../BaseRepository";
import { WidgetResponseData } from "./data";

export const widgetConfig: ConfigProp<WidgetResponseData> = {
  fillables: [
    "document_type_id",
    "department_id",
    "title",
    "component",
    "chart_type",
    "is_active",
    "response",
    "type",
    "groups",
  ],
  associatedResources: [
    { name: "documentTypes", url: "documentTypes" },
    { name: "departments", url: "departments" },
    { name: "groups", url: "groups" },
  ],
  state: {
    id: 0,
    document_type_id: 0,
    department_id: 0,
    progress_tracker_id: 0,
    title: "",
    component: "",
    chart_type: "none",
    is_active: 0,
    response: "resource",
    type: "box",
    groups: [],
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
