import { DataOptionsProps } from "resources/views/components/forms/MultiSelect";
import { Validator } from "../Support/Validator";
import moment from "moment";
import { sprintf } from "sprintf-js";
import { toWords } from "number-to-words";
import { PDFDocument } from "pdf-lib";
import { ProgressTrackerResponseData } from "app/Repositories/ProgressTracker/data";
import { DocumentDraftResponseData } from "app/Repositories/DocumentDraft/data";
import { WorkflowStageResponseData } from "app/Repositories/WorkflowStage/data";
import { TabOptionProps } from "app/Repositories/BaseRepository";

export const accessibleTabs: TabOptionProps[] = [
  {
    title: "Pages",
    label: "pages",
    component: "FilePagesTab",
    icon: "ri-file-copy-2-line",
    variant: "success",
    endpoint: "serviceWorkers",
    hasFile: false,
    appendSignature: true,
    isDefault: true,
    status: "draft",
    sidebar: "AnalysisSidebar",
  },
  {
    title: "Supporting Documents",
    label: "supporting-documents",
    component: "MediaFilesTab",
    icon: "ri-folder-line",
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
  {
    title: "Print Document",
    label: "print",
    component: "PrintDocumentTab",
    icon: "ri-printer-line",
    variant: "dark",
    endpoint: "serviceWorkers",
    hasFile: false,
    appendSignature: false,
    isDefault: false,
    status: "draft",
    sidebar: "PrintSidebar",
  },
];

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

export const formatOptions = (
  data: Record<string, any>[],
  value: string,
  label: string,
  addBase: boolean = false
): DataOptionsProps[] => {
  if (!Array.isArray(data) || data.length < 1) {
    return [];
  }

  const response: DataOptionsProps[] = data.map((row) => ({
    value: row[value],
    label: row[label],
  }));

  const base: DataOptionsProps[] = [{ value: 0, label: "None" }, ...response];

  return addBase ? base : response;
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
  const [whole, fraction] = amount.toFixed(2).split(".");
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
          console.error(
            `Error fetching file from ${path}: ${response.statusText}`
          );
          return null; // Skip this file
        }

        const blob = await response.blob();

        // Extract filename from path or generate a default one
        const fileName = path.split("/").pop() || `file-${index}`;
        const fileType = blob.type || "application/octet-stream"; // Default MIME type

        // Return the constructed File object
        return new File([blob], fileName, { type: fileType });
      } catch (error) {
        console.error(`Failed to fetch file from ${path}: ${error}`);
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
