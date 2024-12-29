export const workflowStageRules: { [key: string]: string } = {
  workflow_id: "required|integer",
  group_id: "required|integer",
  name: "required|string",
  order: "required|integer",
  actions: "required|array",
};
