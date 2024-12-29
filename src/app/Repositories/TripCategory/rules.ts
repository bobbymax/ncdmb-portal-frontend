export const tripCategoryRules: { [key: string]: string } = {
  name: "required|string",
  description: "string",
  accommodation_type: "required|string",
  type: "required|string",
  allowances: "required|array",
};
