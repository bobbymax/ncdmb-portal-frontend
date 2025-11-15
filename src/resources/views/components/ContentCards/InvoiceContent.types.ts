export type InvoiceHeaderType =
  | "text"
  | "integer"
  | "decimal"
  | "currency"
  | "date"
  | "numbering";

export interface InvoiceHeader {
  id: string;
  label: string;
  type: InvoiceHeaderType;
  width: number;
  currencySymbol?: string;
}

export interface InvoiceRow {
  id: string;
  values: Record<string, string>;
}

export interface InvoiceTableSettings {
  adminFee: number;
  showTotals: boolean;
  currencyHeaderId?: string;
}

export interface InvoiceContent {
  headers: InvoiceHeader[];
  rows: InvoiceRow[];
  settings: InvoiceTableSettings;
}

export interface InvoiceTotals {
  subTotal: number;
  adminFee: number;
  vat: number;
  grandTotal: number;
}

export interface InvoiceContentWithTotals extends InvoiceContent {
  totals?: InvoiceTotals | null;
}

export const DEFAULT_VAT_RATE = 7.5;
export const DEFAULT_COLUMN_WIDTH = 20;

export const clampWidthPercent = (value: number): number => {
  if (!Number.isFinite(value)) return DEFAULT_COLUMN_WIDTH;
  if (value < 5) return 5;
  if (value > 100) return 100;
  return Number(value.toFixed(2));
};

const sanitizeCurrencySymbol = (symbol?: string) => {
  if (!symbol || typeof symbol !== "string") return "₦";
  return symbol.trim() || "₦";
};

export const createDefaultHeaders = (): InvoiceHeader[] => [
  {
    id: crypto.randomUUID(),
    label: "Description",
    type: "text",
    width: 60,
  },
  {
    id: crypto.randomUUID(),
    label: "Amount",
    type: "currency",
    width: 40,
    currencySymbol: "₦",
  },
];

export const createEmptyRow = (headers: InvoiceHeader[]): InvoiceRow => ({
  id: crypto.randomUUID(),
  values: headers.reduce<Record<string, string>>((acc, header) => {
    acc[header.id] =
      header.type === "numbering" ? "1" : header.type === "date" ? "" : "";
    return acc;
  }, {}),
});

export const ensureRowsShape = (
  rows: InvoiceRow[],
  headers: InvoiceHeader[]
): InvoiceRow[] => {
  const headerMap = new Map(headers.map((header) => [header.id, header]));

  return rows.map((row, rowIndex) => {
    const id = row?.id ?? crypto.randomUUID();
    const values = headers.reduce<Record<string, string>>((acc, header) => {
      const existingValue = row?.values?.[header.id];
      if (header.type === "numbering") {
        acc[header.id] = String(rowIndex + 1);
      } else if (existingValue !== undefined) {
        acc[header.id] = String(existingValue);
      } else {
        acc[header.id] = "";
      }

      if (header.type === "currency") {
        header.currencySymbol = sanitizeCurrencySymbol(header.currencySymbol);
      }

      return acc;
    }, {});

    headerMap.forEach((header) => {
      if (!values[header.id]) {
        values[header.id] = header.type === "numbering" ? "0" : "";
      }
    });

    return {
      id,
      values,
    };
  });
};

export const autoNumberRows = (
  rows: InvoiceRow[],
  headers: InvoiceHeader[]
): InvoiceRow[] => {
  const numberingHeaders = headers.filter(
    (header) => header.type === "numbering"
  );

  if (!numberingHeaders.length) return rows;

  return rows.map((row, index) => {
    const updatedValues = { ...row.values };
    numberingHeaders.forEach((header) => {
      updatedValues[header.id] = String(index + 1);
    });
    return { ...row, values: updatedValues };
  });
};

export const normalizeInvoiceContent = (
  value: unknown
): InvoiceContentWithTotals => {
  const defaultContent: InvoiceContentWithTotals = {
    headers: createDefaultHeaders(),
    rows: [],
    settings: {
      adminFee: 0,
      showTotals: false,
      currencyHeaderId: undefined,
    },
    totals: null,
  };

  if (!value || typeof value !== "object") {
    return defaultContent;
  }

  const content = value as Partial<InvoiceContentWithTotals>;

  const headers = Array.isArray(content.headers)
    ? content.headers
        .filter(
          (header): header is InvoiceHeader =>
            !!header &&
            typeof header === "object" &&
            typeof header.id === "string"
        )
        .map((header) => ({
          ...header,
          label: typeof header.label === "string" ? header.label : "",
          type: header.type ?? "text",
          width: clampWidthPercent(
            typeof header.width === "number"
              ? header.width
              : DEFAULT_COLUMN_WIDTH
          ),
          currencySymbol:
            header.type === "currency"
              ? sanitizeCurrencySymbol(header.currencySymbol)
              : undefined,
        }))
    : defaultContent.headers;

  const rows = Array.isArray(content.rows)
    ? content.rows
        .filter(
          (row): row is InvoiceRow =>
            !!row && typeof row === "object" && typeof row.id === "string"
        )
        .map((row) => ({
          ...row,
          values: headers.reduce<Record<string, string>>((acc, header) => {
            const value = row.values?.[header.id];
            if (value === undefined || value === null) {
              acc[header.id] =
                header.type === "numbering"
                  ? "0"
                  : header.type === "date"
                  ? ""
                  : "";
            } else {
              acc[header.id] = String(value);
            }
            return acc;
          }, {}),
        }))
    : [];

  const settings: InvoiceTableSettings = {
    adminFee:
      typeof content.settings?.adminFee === "number"
        ? Math.min(Math.max(content.settings.adminFee, 0), 100)
        : 0,
    showTotals: Boolean(content.settings?.showTotals),
    currencyHeaderId: content.settings?.currencyHeaderId,
  };

  const withShape = ensureRowsShape(rows, headers);

  if (
    settings.showTotals &&
    settings.currencyHeaderId &&
    !headers.some((header) => header.id === settings.currencyHeaderId)
  ) {
    settings.currencyHeaderId =
      headers.find((header) => header.type === "currency")?.id ?? undefined;
  }

  const normalized: InvoiceContentWithTotals = {
    headers,
    rows: autoNumberRows(withShape, headers),
    settings,
    totals: content.totals ?? null,
  };

  if (!normalized.totals) {
    normalized.totals = computeInvoiceTotals(normalized, DEFAULT_VAT_RATE);
  }

  return normalized;
};

export const parseNumericValue = (value: string): number => {
  if (!value) return 0;
  const sanitized = value.replace(/[^0-9.-]/g, "");
  const parsed = Number(sanitized);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const formatCurrencyValue = (
  amount: number,
  symbol?: string,
  locale: string = "en-NG"
): string => {
  const formatter = new Intl.NumberFormat(locale, {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const formatted = formatter.format(amount);
  return symbol ? `${symbol}${formatted}` : formatted;
};

export const computeInvoiceTotals = (
  content: InvoiceContent,
  vatRate: number
): InvoiceTotals | null => {
  const { headers, rows, settings } = content;
  if (!settings.showTotals || !settings.currencyHeaderId) {
    return null;
  }

  const currencyHeader = headers.find(
    (header) => header.id === settings.currencyHeaderId
  );

  if (!currencyHeader) return null;

  const subTotal = rows.reduce((total, row) => {
    return total + parseNumericValue(row.values?.[currencyHeader.id] ?? "");
  }, 0);

  const hasAdminFee = settings.adminFee > 1;

  const adminFeeAmount = hasAdminFee ? (subTotal * settings.adminFee) / 100 : 0;

  const vatBase = hasAdminFee ? adminFeeAmount : subTotal;
  const vatAmount = vatBase * (vatRate / 100);
  const grandTotal = hasAdminFee
    ? subTotal + adminFeeAmount + vatAmount
    : subTotal + vatAmount;

  return {
    subTotal,
    adminFee: adminFeeAmount,
    vat: vatAmount,
    grandTotal,
  };
};
