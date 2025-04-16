export const paymentBatchRules: { [key: string]: string } = {
  user_id: "required|integer",
  department_id: "required|integer",
  budget_year: "required|integer",
  expenditures: "required|array",
  fund_id: "required|integer",
  workflow_id: "required|integer",
  document_type_id: "required|integer",
  document_category_id: "required|integer",
  type: "required|string",
};
