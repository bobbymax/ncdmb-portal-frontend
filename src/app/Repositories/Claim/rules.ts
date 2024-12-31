export const claimRules: { [key: string]: string } = {
  total_amount_spent: "required",
  expenses: "required|array",
  supporting_documents: "required|array",
  type: "required|string",
  sponsoring_department_id: "required|integer",
  title: "required|string",
  start_date: "required|string",
  end_date: "required|string",
};
