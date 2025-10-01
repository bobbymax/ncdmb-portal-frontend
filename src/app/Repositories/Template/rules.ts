export const templateRules: { [key: string]: string } = {
  name: "required|string|max:255",
  signature_display: "required|string",
  with_dates: "required|integer",
  header: "required|string",
  footer: "required|string",
};
