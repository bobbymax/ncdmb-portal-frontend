export const workflowStageRules: { [key: string]: string } = {
  workflow_stage_category_id: "required|integer",
  group_id: "required|integer",
  name: "required|string",
  actions: "required|array",
};
