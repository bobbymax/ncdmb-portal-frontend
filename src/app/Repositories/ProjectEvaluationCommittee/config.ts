import { ConfigProp } from "../BaseRepository";
import { ProjectEvaluationCommitteeResponseData } from "./data";

export const projectEvaluationCommitteeConfig: ConfigProp<ProjectEvaluationCommitteeResponseData> = {
  fillables: [
    "project_id",
    "committee_name",
    "committee_type",
    "chairman_id",
    "members",
    "status",
    "formed_at",
  ],
  
  associatedResources: [
    { name: "projects", url: "projects" },
    { name: "users", url: "users" },
  ],
  
  state: {
    id: 0,
    project_id: 0,
    committee_name: "",
    committee_type: "technical",
    chairman_id: 0,
    members: null,
    status: "active",
    formed_at: null,
    dissolved_at: null,
    created_at: "",
    updated_at: "",
  },
  
  actions: [
    { label: "view", icon: "ri-eye-line", variant: "info", conditions: [], operator: "and", display: "View" },
    { label: "update", icon: "ri-pencil-line", variant: "warning", conditions: [], operator: "and", display: "Edit" },
    { label: "block", icon: "ri-close-circle-line", variant: "danger", conditions: [], operator: "and", display: "Dissolve" },
  ],
};

