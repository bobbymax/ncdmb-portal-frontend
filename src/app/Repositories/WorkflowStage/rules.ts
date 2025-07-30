export const workflowStageRules: { [key: string]: string } = {
  workflow_stage_category_id: "required|integer",
  name: "required|string",
  actions: "required|array",
  recipients: "required|array",
  groups: "required|array",
  isDisplayed: "required",
  flow: "required|string",
};
