import { DataOptionsProps } from "resources/views/components/forms/MultiSelect";
import { Validator } from "../Support/Validator";
import moment from "moment";
import { sprintf } from "sprintf-js";
import { toWords } from "number-to-words";
import { PDFDocument } from "pdf-lib";
import { ProgressTrackerResponseData } from "app/Repositories/ProgressTracker/data";
import { DocumentDraftResponseData } from "app/Repositories/DocumentDraft/data";
import { WorkflowStageResponseData } from "app/Repositories/WorkflowStage/data";
import { BaseResponse, TabOptionProps } from "app/Repositories/BaseRepository";
import { TransactionResponseData } from "app/Repositories/Transaction/data";
import axios from "axios";
import pluralize from "pluralize";
import { ConfigState } from "app/Hooks/useTemplateHeader";
import { SignaturePadGroupProps } from "../Hooks/useBuilder";

const GOOGLE_API_KEY = "AIzaSyAgfl2V6_4HkCuqMnDDLl_mUhmIaEY4yXk";

export const accessibleTabs: TabOptionProps[] = [
  {
    title: "Document",
    label: "document",
    component: "FilePagesTab",
    icon: "ri-book-shelf-line",
    variant: "success",
    endpoint: "serviceWorkers",
    hasFile: false,
    appendSignature: true,
    isDefault: true,
    status: "draft",
    sidebar: "AnalysisSidebar",
  },
  {
    title: "Uploads",
    label: "uploads",
    component: "MediaFilesTab",
    icon: "ri-gallery-upload-line",
    variant: "dark",
    endpoint: "serviceWorkers",
    hasFile: false,
    appendSignature: true,
    isDefault: false,
    status: "draft",
    sidebar: "OcrAnalysisSidebar",
  },
  {
    title: "Updates",
    label: "updates",
    component: "FileUpdateTab",
    icon: "ri-booklet-line",
    variant: "info",
    endpoint: "serviceWorkers",
    hasFile: false,
    appendSignature: false,
    isDefault: false,
    status: "draft",
    sidebar: "TrackingSidebar",
  },
  {
    title: "Manage",
    label: "manage",
    component: "TerminateProcessTab",
    icon: "ri-file-shred-line",
    variant: "warning",
    endpoint: "serviceWorkers",
    hasFile: false,
    appendSignature: false,
    isDefault: false,
    status: "draft",
    sidebar: "AdminSidebar",
  },
];

export const toSmartSingular = (title: string): string => {
  const words = title.trim().split(" ");
  const last = words.pop() ?? "";
  const singular = pluralize.singular(last);
  return [...words, singular].join(" ");
};

export const extractFourDigitsAfterFirstChar = (input: string) => {
  const match = input.match(/^[A-Za-z](\d{4})/);
  return match ? match[1] : null;
};

export const generateApprovalsFromConfig = (
  config: ConfigState
): SignaturePadGroupProps[] => {
  const approvals: SignaturePadGroupProps[] = [];
  let order = 1;

  // Check if we should use approvers array (when stage/group values are 0)
  const shouldUseApprovers =
    config.from?.state?.stage?.value === 0 ||
    config.from?.state?.group?.value === 0 ||
    config.through?.state?.stage?.value === 0 ||
    config.through?.state?.group?.value === 0 ||
    config.to?.state?.stage?.value === 0 ||
    config.to?.state?.group?.value === 0;

  // If approvers array exists and we should use it, generate from approvers
  if (
    shouldUseApprovers &&
    config.approvers?.state &&
    Array.isArray(config.approvers.state)
  ) {
    const approversArray = config.approvers.state;

    approversArray.forEach((approver, index) => {
      if (approver.staff || approver.group || approver.department) {
        approvals.push({
          group: approver.group,
          fallback_group: null,
          approver: approver.staff || null,
          department: approver.department,
          carder_id: 0,
          signatory: null,
          approval_type:
            index === 0
              ? "initiator"
              : approver.is_approving
              ? "approval"
              : "witness",
          identifier: crypto.randomUUID(),
          is_signed: false,
          can_override: false,
          make_comment: 0,
          order: order++,
          meta_data: {
            process_type: "approver",
            stage: approver.stage,
            permissions: approver.permissions,
            approver_index: index,
          },
        });
      }
    });

    return approvals;
  }

  // Original logic for from, through, to
  // Add "from" as initiator (first signatory)
  if (config.from?.state) {
    const fromState = config.from.state;

    if (fromState.staff || fromState.group || fromState.department) {
      approvals.push({
        group: fromState.group,
        fallback_group: null,
        approver: fromState.staff || null,
        department: fromState.department,
        carder_id: 0, // You might want to get this from staff data
        signatory: null,
        approval_type: "initiator",
        identifier: crypto.randomUUID(),
        is_signed: false,
        can_override: false,
        make_comment: 0,
        order: order++,
        meta_data: {
          process_type: "from",
          stage: fromState.stage,
          permissions: fromState.permissions,
        },
      });
    }
  }

  // Add "through" states as intermediate signatories
  if (config.through?.state) {
    const throughState = config.through.state;

    if (throughState.staff || throughState.group || throughState.department) {
      approvals.push({
        group: throughState.group,
        fallback_group: null,
        approver: throughState.staff || null,
        department: throughState.department,
        carder_id: 0,
        signatory: null,
        approval_type: throughState.is_approving ? "approval" : "witness",
        identifier: crypto.randomUUID(),
        is_signed: false,
        can_override: false,
        make_comment: 0,
        order: order++,
        meta_data: {
          process_type: "through",
          stage: throughState.stage,
          permissions: throughState.permissions,
        },
      });
    }
  }

  // Add "to" as final approver
  if (config.to?.state) {
    const toState = config.to.state;

    if (toState.staff || toState.group || toState.department) {
      approvals.push({
        group: toState.group,
        fallback_group: null,
        approver: toState.staff || null,
        department: toState.department,
        carder_id: 0,
        signatory: null,
        approval_type: "approval",
        identifier: crypto.randomUUID(),
        is_signed: false,
        can_override: false,
        make_comment: 0,
        order: order++,
        meta_data: {
          process_type: "to",
          stage: toState.stage,
          permissions: toState.permissions,
        },
      });
    }
  }

  return approvals;
};

export const getDistanceInKm = async (
  origin: string,
  destination: string
): Promise<number | null> => {
  const endpoint = "https://maps.googleapis.com/maps/api/distancematrix/json";

  try {
    const response = await axios.get(endpoint, {
      params: {
        origins: origin,
        destinations: destination,
        key: GOOGLE_API_KEY,
        units: "metric",
      },
    });

    const distance = response.data.rows[0].element[0].distance.value;
    return distance / 1000;
  } catch (error) {
    // Error fetching distance
    return null;
  }
};

export const getBeneficiaryTag = (beneficiary: string): string => {
  let collector: string;

  switch (beneficiary) {
    case "entity":
      collector = "Entity";
      break;
    case "third-party":
      collector = "Vendor";
      break;
    default:
      collector = "User";
      break;
  }

  return collector;
};

export const dates = (dateTime: string | undefined) => {
  if (!dateTime) {
    return {
      day: "",
      month: "",
      year: "",
    };
  }

  const date = moment(dateTime);

  return {
    day: date.format("DD"),
    month: date.format("MMMM"),
    year: date.format("YYYY"),
  };
};

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

// Proper function to format number correctly
export // Function to format numbers with commas and allow decimals
const formatNumber = (value: string) => {
  // Ensure only numbers and a single decimal point are allowed
  const [integerPartRaw, decimalPart] = value?.split(".") ?? "";

  // Format the integer part with commas
  const integerPart = integerPartRaw?.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // If there’s a decimal part, retain it
  return decimalPart !== undefined
    ? `${integerPart}.${decimalPart}`
    : integerPart;
};

export const getCookie = (name: string): string | null => {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
};

export const formatText = (input: string): string => {
  if (!input.trim()) return ""; // Return empty string if input is empty

  return input
    .replace(/-/g, " ") // Replace hyphens with spaces
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize each word
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

export const formatAmountNoCurrency = (
  amount: number,
  locale: string = "en-US"
): string => {
  return new Intl.NumberFormat(locale, {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const except = (text: string, maxLength: number): string => {
  if (!text || typeof text !== "string") return "";
  return text.length > maxLength
    ? text.slice(0, maxLength).trimEnd() + "..."
    : text;
};

export const formatOptions = (
  data: Record<string, any>[],
  value: string,
  label: string,
  addBase: boolean = false,
  isInteger: boolean = false,
  labelText: string = "None"
): DataOptionsProps[] => {
  if (!Array.isArray(data) || data.length < 1) {
    return [];
  }

  const response: DataOptionsProps[] = data.map((row) => ({
    value: isInteger ? Number(row[value]) : row[value],
    label: row[label],
  }));

  const base: DataOptionsProps[] = [
    { value: 0, label: labelText },
    ...response,
  ];

  return addBase ? base : response;
};

export const pluck = (arr: any[], key: string) => {
  return arr.map((item) => item[key]);
};

export const checkSignaturePosition = (
  position: number,
  node: ProgressTrackerResponseData | null,
  drafts: DocumentDraftResponseData[],
  draftId: number,
  stage: WorkflowStageResponseData | null
) => {
  if (position < 1 || draftId < 1 || drafts.length < 1 || !stage || !node) {
    return false;
  }

  const thisDraft = drafts.find(
    (draft) =>
      draft.progress_tracker_id === node.id &&
      draft.current_workflow_stage_id === stage.id
  );

  if (!thisDraft || stage.append_signature !== 1) return false;

  return node.order === position;
};

export const options = (
  data: Record<string, any>[],
  column: string
): DataOptionsProps[] => {
  if (!Array.isArray(data) || data.length < 1) {
    return [];
  }

  return formatOptions(data, "id", column);
};

export const generateRandomNumbers = (
  count: number,
  min: number,
  max: number
) => {
  // 1: Create a `Set` object
  const uniqueNumbers = new Set();
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

export const fetchResourceObjectOrValue = <T extends BaseResponse>(
  collection: T[],
  param: string | number,
  key: keyof T = "id"
) => {
  if (!collection || collection.length < 1 || !param) return;

  return collection.find((raw) => raw[key] === param);
};

export const syncPartialIntoLocal = (
  partials: Partial<TransactionResponseData>[],
  locals: TransactionResponseData[],
  matchKey: keyof TransactionResponseData = "id"
): TransactionResponseData[] => {
  return partials.map((partial) => {
    const match = locals.find((local) => local[matchKey] === partial[matchKey]);

    if (match) {
      return {
        ...match, // Keep full structure + user edits
        ...partial, // Overwrite only fields from partial (e.g. refreshed values)
      };
    }

    // If no match, hydrate the missing one — either with default or fresh generation
    return {
      id: partial.reference ?? generateUniqueString(16),
      ...partial,
    } as TransactionResponseData;
  });
};

/**
 * Formats a numeric string with commas and allows decimals.
 * Example: "1234567.89" → "1,234,567.89"
 */
export const formatInputNumber = (value: string): string => {
  // Remove all characters except digits and dots
  const cleaned = value.replace(/[^0-9.]/g, "");

  // Prevent multiple decimal points
  const parts = cleaned.split(".");
  const integerPart = parts[0];
  const decimalPart = parts[1] !== undefined ? parts[1].slice(0, 2) : undefined; // optional: limit to 2 decimal places

  // Format integer part with commas
  const formattedInt = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // Return with or without decimal part
  return decimalPart !== undefined
    ? `${formattedInt}.${decimalPart}`
    : formattedInt;
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

export const formatDateToPeriodString = (
  start_date: string,
  end_date: string
) => {
  if (start_date === "" || end_date === "") {
    return "The date period for this claim has not been set!";
  }

  const start = moment(start_date);
  const end = moment(end_date);

  return `${start.format("ll")} - ${end.format("ll")}`;
};

const addAndToWords = (words: string): string => {
  const parts = words.split(" ");
  const indexOfHundred = parts.lastIndexOf("hundred");

  if (indexOfHundred !== -1 && parts.length > indexOfHundred + 1) {
    // Insert "and" after "hundred"
    parts.splice(indexOfHundred + 1, 0, "and");
  }

  return parts.join(" ");
};

export const covertToWords = (amount: number): string => {
  const [whole, fraction] = (amount ?? 0).toFixed(2).split(".");
  const wholeWords = addAndToWords(toWords(parseInt(whole, 10)));
  let result = `${wholeWords} Naira`;

  if (parseInt(fraction, 10) > 0) {
    const fractionWords = toWords(parseInt(fraction, 10));
    result += ` ${fractionWords} Kobo`;
  }

  result += " Only!";

  return result.replace(/^\w/, (c) => c.toUpperCase());
};

export const fetchFilesFromUrls = async (
  filePaths: string[]
): Promise<File[]> => {
  const files: (File | null)[] = await Promise.all(
    filePaths.map(async (path, index) => {
      try {
        const response = await fetch(path);

        // Check for successful fetch
        if (!response.ok) {
          // Error fetching file
          return null; // Skip this file
        }

        const blob = await response.blob();

        // Extract filename from path or generate a default one
        const fileName = path.split("/").pop() || `file-${index}`;
        const fileType = blob.type || "application/octet-stream"; // Default MIME type

        // Return the constructed File object
        return new File([blob], fileName, { type: fileType });
      } catch (error) {
        // Failed to fetch file
        return null; // Skip this file
      }
    })
  );

  // Filter out nulls (failed fetches) before returning
  return files.filter((file): file is File => file !== null);
};

export const arrayToFileList = (files: File[]): FileList => {
  const dataTransfer = new DataTransfer();
  files.forEach((file) => dataTransfer.items.add(file));
  return dataTransfer.files;
};

export const handleProgressFlow = (
  draftCount: number = 0,
  trackers: ProgressTrackerResponseData[]
): number => {
  if (draftCount < 1 || trackers.length < 1) {
    return 0;
  }

  return Math.round((draftCount * 100) / trackers.length);
};

/**
 * Formats a number or string to currency format with configurable options
 *
 * @param amount - The amount to format (string or number)
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export const formatCurrencyCompact = (
  amount: string | number,
  options: {
    currency?: string;
    showCurrency?: boolean;
    decimals?: number;
    locale?: string;
    compactThreshold?: number; // Minimum value to use compact format
  } = {}
): string => {
  const {
    currency = "₦",
    showCurrency = true,
    decimals = 2,
    locale = "en-US",
    compactThreshold = 1000,
  } = options;

  // Convert to number and handle invalid inputs
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  if (isNaN(numAmount) || numAmount === 0) {
    return showCurrency ? `${currency}0.00` : "0.00";
  }

  // Only use compact format if amount is above threshold
  if (Math.abs(numAmount) >= compactThreshold) {
    // Define abbreviations and their values
    const abbreviations = [
      { value: 1e12, symbol: "T" }, // Trillion
      { value: 1e9, symbol: "B" }, // Billion
      { value: 1e6, symbol: "M" }, // Million
      { value: 1e3, symbol: "K" }, // Thousand
    ];

    // Find the appropriate abbreviation
    for (const { value, symbol } of abbreviations) {
      if (Math.abs(numAmount) >= value) {
        const abbreviated = numAmount / value;
        const formatted = abbreviated.toFixed(decimals);

        // Remove trailing zeros after decimal point
        const cleanFormatted = parseFloat(formatted).toString();

        return showCurrency
          ? `${currency}${cleanFormatted}${symbol}`
          : `${cleanFormatted}${symbol}`;
      }
    }
  }

  // For amounts below threshold, format with commas and specified decimal places
  const formatted = numAmount.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return showCurrency ? `${currency}${formatted}` : formatted;
};
