export const tripRules: { [key: string]: string } = {
  departure_city_id: "required|integer",
  destination_city_id: "required|integer",
  per_diem_category_id: "required|integer",
  purpose: "required|string",
  departure_date: "required",
  return_date: "required",
  accommodation_type: "required|string",
  type: "required|string",
  total_amount_spent: "required",
};
