export const inboundRules: { [key: string]: string } = {
  from_name: "required|string|min:3",
  from_email: "required|email",
  priority: "required|in:low,medium,high",
  security_class: "required|in:public,internal,confidential,secret",
  file_uploads: "required|array",
};
