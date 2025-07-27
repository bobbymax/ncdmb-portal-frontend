export const milestoneRules: { [key: string]: string } = {
  milestoneable_id: "required|integer",
  milestoneable_type: "required|string",
  description: "required|string",
  percentage_completion: "required",
  duration: "required|integer",
  frequency: "required|string",
  status: "required|string",
  is_closed: "required|integer",
};
