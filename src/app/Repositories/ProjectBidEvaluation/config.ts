import { ConfigProp } from "../BaseRepository";
import { ProjectBidEvaluationResponseData } from "./data";

export const projectBidEvaluationConfig: ConfigProp<ProjectBidEvaluationResponseData> = {
  fillables: [
    "project_bid_id",
    "evaluator_id",
    "evaluation_type",
    "evaluation_date",
    "criteria",
    "total_score",
    "pass_fail",
    "comments",
    "recommendations",
    "status",
  ],
  
  associatedResources: [
    { name: "projectBids", url: "procurement/bids" },
    { name: "users", url: "users" },
  ],
  
  state: {
    id: 0,
    project_bid_id: 0,
    evaluator_id: 0,
    evaluation_type: "technical",
    evaluation_date: "",
    criteria: null,
    total_score: null,
    pass_fail: null,
    comments: null,
    recommendations: null,
    status: "draft",
    created_at: "",
    updated_at: "",
  },
  
  actions: [
    { label: "view", icon: "ri-eye-line", variant: "info", conditions: [], operator: "and", display: "View" },
    { label: "update", icon: "ri-pencil-line", variant: "warning", conditions: [], operator: "and", display: "Edit" },
    { label: "manage", icon: "ri-send-plane-line", variant: "success", conditions: [], operator: "and", display: "Submit" },
  ],
};

