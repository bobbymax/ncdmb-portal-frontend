export const documentActionRules: { [key: string]: string } = {
  name: "required|string",
  button_text: "required|string",
  url: "required|string",
  icon: "string",
  variant: "string",
  action_status: "required|string",
  state: "required|string",
  has_update: "required",
  component: "string",
  mode: "required|string",
};
