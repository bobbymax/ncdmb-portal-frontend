/**
 * Date formatting utilities for HTML input elements
 * Handles conversion from backend ISO timestamps to HTML-compatible formats
 */

/**
 * Format ISO date for HTML date input (yyyy-MM-dd)
 * @param dateString - ISO date string from backend (e.g., "2025-11-28T00:00:00.000000Z")
 * @returns Formatted date string (e.g., "2025-11-28")
 * @example formatDateForInput("2025-11-28T00:00:00.000000Z") → "2025-11-28"
 */
export const formatDateForInput = (
  dateString: string | null | undefined
): string => {
  if (!dateString) return "";
  // Extract just the date part from ISO timestamp
  return dateString.split("T")[0];
};

/**
 * Format ISO datetime for HTML datetime-local input (yyyy-MM-ddThh:mm)
 * @param dateString - ISO datetime string from backend (e.g., "2025-11-28T14:30:00.000000Z")
 * @returns Formatted datetime string (e.g., "2025-11-28T14:30")
 * @example formatDateTimeForInput("2025-11-28T14:30:00.000000Z") → "2025-11-28T14:30"
 */
export const formatDateTimeForInput = (
  dateString: string | null | undefined
): string => {
  if (!dateString) return "";
  // Convert ISO timestamp to datetime-local format
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Format ISO date for display (human-readable format)
 * @param dateString - ISO date string
 * @returns Formatted date (e.g., "Nov 28, 2025")
 */
export const formatDateForDisplay = (
  dateString: string | null | undefined
): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * Format ISO datetime for display (human-readable format)
 * @param dateString - ISO datetime string
 * @returns Formatted datetime (e.g., "Nov 28, 2025 at 2:30 PM")
 */
export const formatDateTimeForDisplay = (
  dateString: string | null | undefined
): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

