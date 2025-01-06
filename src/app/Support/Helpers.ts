import { DataOptionsProps } from "resources/views/components/forms/MultiSelect";
import { Validator } from "../Support/Validator";
import moment from "moment";
import { sprintf } from "sprintf-js";

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

export const formatUrl = (
  urlTemplate: string,
  ...params: (string | number)[]
): string => {
  if (urlTemplate === "") {
    return "";
  }

  // Check if the URL contains placeholders (%d, %s, etc.)
  const placeholderRegex = /%[ds]/g;
  const matches = urlTemplate.match(placeholderRegex);

  if (!matches) {
    // No placeholders, return the URL as-is
    return urlTemplate;
  }

  // Ensure the number of placeholders matches the provided parameters
  if (matches.length > params.length) {
    throw new Error(
      `Insufficient parameters for URL template: Expected ${matches.length}, but got ${params.length}`
    );
  }

  // Format the URL using sprintf
  return sprintf(urlTemplate, ...params);
};

export const formatCurrency = (
  amount: number,
  currency: "NGN" | "USD" | "GBP" = "NGN",
  locale: string = "en-NG"
) => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatOptions = (
  data: Record<string, any>[],
  value: string,
  label: string
): DataOptionsProps[] => {
  if (!Array.isArray(data) || data.length < 1) {
    return [];
  }

  const response: DataOptionsProps[] = data.map((row) => ({
    value: row[value],
    label: row[label],
  }));

  return response;
};

export const generateRandomNumbers = (
  count: number,
  min: number,
  max: number
) => {
  // 1: Create a `Set` object
  let uniqueNumbers = new Set();
  while (uniqueNumbers.size < count) {
    // 2: Generate each random number
    uniqueNumbers.add(Math.floor(Math.random() * (max - min + 1)) + min);
  }
  // 3: Immediately insert them numbers into the Set...
  return Array.from(uniqueNumbers);
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

export const getEarliestAndLatestDates = (
  dates: string[]
): { earliest: string; latest: string } => {
  if (dates.length === 0) {
    return { earliest: "", latest: "" };
  }

  // Convert strings to Moment objects and find the min and max dates
  const momentDates = dates.map((date) => moment(date, "YYYY-MM-DD"));
  const earliest = moment.min(momentDates).format("YYYY-MM-DD");
  const latest = moment.max(momentDates).format("YYYY-MM-DD");

  return { earliest, latest };
};
