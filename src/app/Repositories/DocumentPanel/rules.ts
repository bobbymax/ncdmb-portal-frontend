export const documentPanelRules: { [key: string]: string } = {
  name: "required|string|max:255",
  icon: "required|string|max:255",
  component_path: "required|string|max:255",
  order: "required|integer",
  visibility_mode: "required|string",
  // is_global: "required|boolean",
};
