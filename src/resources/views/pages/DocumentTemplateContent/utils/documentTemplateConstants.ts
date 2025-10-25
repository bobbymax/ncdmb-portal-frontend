/**
 * Constants for DocumentTemplateContent
 */

export const DEFAULT_META_DATA = {
  policy: {
    strict: false,
    scope: "private" as const,
    access_token: "",
    can_override: false,
    clearance_level: null,
    fallback_approver: null,
    for_signed: false,
    days: 30,
    frequency: "days" as const,
  },
  recipients: [],
  actions: [],
  activities: [],
  comments: [],
  settings: {
    priority: "medium" as const,
    accessLevel: "private" as const,
    access_token: "",
    lock: false,
    confidentiality: "general" as const,
  },
};

export const DEFAULT_PREFERENCES = {
  priority: "medium" as const,
  accessLevel: "private" as const,
  access_token: "",
  lock: false,
  confidentiality: "general" as const,
};

export const SAMPLE_BLOCKS = [
  { id: "1", title: "Header", icon: "ri-heading" },
  { id: "2", title: "Text", icon: "ri-text" },
  { id: "3", title: "Table", icon: "ri-table-line" },
  { id: "4", title: "List", icon: "ri-list-check" },
  { id: "5", title: "Image", icon: "ri-image-line" },
  { id: "6", title: "Chart", icon: "ri-bar-chart-line" },
];

export const DEFAULT_TAB_ORDER = [
  {
    id: "budget",
    label: "Budget",
    icon: "ri-bank-line",
    isEditor: true,
    isViewOnly: false,
    componentPath: "BudgetGeneratorTab",
  },
  {
    id: "uploads",
    label: "Uploads",
    icon: "ri-git-repository-commits-line",
    isEditor: true,
    isViewOnly: false,
    componentPath: "UploadsGeneratorTab",
  },
  {
    id: "resource",
    label: "Resource",
    icon: "ri-database-2-line",
    isEditor: true,
    isViewOnly: false,
    componentPath: "ResourceGeneratorTab",
  },
  {
    id: "process",
    label: "Process",
    icon: "ri-swap-2-line",
    isEditor: false,
    isViewOnly: true,
    componentPath: "ProcessGeneratorTab",
  },
  {
    id: "activities",
    label: "Activities",
    icon: "ri-line-chart-line",
    isEditor: false,
    isViewOnly: true,
    componentPath: "ActivitiesGeneratorTab",
  },
];
