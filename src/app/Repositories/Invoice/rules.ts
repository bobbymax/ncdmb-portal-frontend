export const invoiceRules: { [key: string]: string } = {
  invoiceable_id: "required|integer",
  invoiceable_type: "required|string",
  invoice_number: "required|string",
  sub_total_amount: "required",
  grand_total_amount: "required",
  currency: "required|string",
  items: "required|array",
};
