import { ConfigProp } from "../BaseRepository";
import { MilestoneResponseData } from "./data";

export const milestoneConfig: ConfigProp<MilestoneResponseData> = {
  fillables: [
    "milestoneable_id",
    "milestoneable_type",
    "description",
    "percentage_completion",
    "duration",
    "frequency",
    "status",
    "is_closed",
  ],
  associatedResources: [],
  state: {
    id: 0,
    milestoneable_id: 0,
    milestoneable_type: "",
    description: "",
    percentage_completion: 0,
    duration: 0,
    frequency: "days",
    status: "active",
    is_closed: 0,
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
