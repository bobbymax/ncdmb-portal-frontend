export const projectRules: { [key: string]: string } = {
  user_id: "required|integer",
  department_id: "required|integer",
  threshold_id: "required|integer",
  project_category_id: "required|integer",
  title: "required|string",
  description: "string",
  total_proposed_amount: "required",
  type: "required|string",
};
