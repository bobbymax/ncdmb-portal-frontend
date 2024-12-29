export const claimRules: { [key: string]: string } = {
  total_amount_spent: "required",
  total_amount_approved: "required",
  total_amount_retired: "required",
  type: "required|string",
  trips: "required|array",
};
