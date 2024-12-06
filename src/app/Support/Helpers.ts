import { DataOptionsProps } from "resources/views/components/forms/MultiSelect";
import { Validator } from "../Support/Validator";

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

export const formatOptions = (
  data: Record<string, any>[],
  value: string,
  label: string
): DataOptionsProps[] => {
  if (data.length < 1) {
    return [];
  }

  const response: DataOptionsProps[] = data.map((row) => ({
    value: row[value],
    label: row[label],
  }));

  return response;
};

export const generateUniqueString = (length: number = 43): string => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+";
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }
  return result;
};

export const generateShortUniqueString = (length: number = 8): string => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
