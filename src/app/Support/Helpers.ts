import { Validator } from "@support/Validator";

export const validate = (
  fillables: string[],
  rules: { [key: string]: string },
  data: { [key: string]: any }
): { success: boolean; errors: string[] } => {
  const validator = new Validator(fillables, rules, data);

  validator.validate();

  if (validator.fails()) {
    return { success: false, errors: validator.getErrors() };
  }

  return { success: true, errors: [] };
};
