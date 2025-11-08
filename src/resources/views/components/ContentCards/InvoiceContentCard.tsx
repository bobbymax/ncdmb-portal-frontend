import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ContentBlock } from "@/resources/views/crud/DocumentTemplateBuilder";
import { usePaperBoard } from "app/Context/PaperBoardContext";
import { SheetProps } from "resources/views/pages/DocumentTemplateContent";
import { useModal } from "app/Context/ModalContext";
import InvoiceContentCardModal from "../ContentCardModals/InvoiceContentCardModal";
import {
  DEFAULT_COLUMN_WIDTH,
  DEFAULT_VAT_RATE,
  clampWidthPercent,
  InvoiceContent,
  InvoiceHeader,
  InvoiceHeaderType,
  InvoiceRow,
  InvoiceTableSettings,
  InvoiceTotals,
  autoNumberRows,
  computeInvoiceTotals,
  createEmptyRow,
  ensureRowsShape,
  formatCurrencyValue,
  normalizeInvoiceContent,
  parseNumericValue,
} from "./InvoiceContent.types";

interface InvoiceContentCardProps {
  item: ContentBlock;
  onClose: () => void;
  isEditing: boolean;
}

const HEADER_TYPE_OPTIONS: Array<{ label: string; value: InvoiceHeaderType }> =
  [
    { label: "Text", value: "text" },
    { label: "Integer", value: "integer" },
    { label: "Decimal", value: "decimal" },
    { label: "Currency", value: "currency" },
    { label: "Date", value: "date" },
    { label: "Numbering", value: "numbering" },
  ];

const clampAdminFee = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 100) return 100;
  return Number(value.toFixed(2));
};

const ensureAtLeastOneRow = (
  rows: InvoiceRow[],
  headers: InvoiceHeader[]
): InvoiceRow[] => {
  if (!headers.length) return [];
  if (rows.length > 0) return rows;
  return [createEmptyRow(headers)];
};

const sanitizeHeaders = (headers: InvoiceHeader[]): InvoiceHeader[] =>
  headers.map((header) => ({
    ...header,
    label: header.label.trim(),
    width: clampWidthPercent(
      Number.isFinite(header.width) ? header.width : DEFAULT_COLUMN_WIDTH
    ),
    currencySymbol:
      header.type === "currency"
        ? (header.currencySymbol && header.currencySymbol.trim()) || "₦"
        : undefined,
  }));

const buildInvoiceContentForSave = (
  headers: InvoiceHeader[],
  rows: InvoiceRow[],
  settings: InvoiceTableSettings
): InvoiceContent => {
  const sanitizedHeaders = sanitizeHeaders(headers);
  const rowsWithShape = ensureRowsShape(rows, sanitizedHeaders);
  const numberedRows = autoNumberRows(
    ensureAtLeastOneRow(rowsWithShape, sanitizedHeaders),
    sanitizedHeaders
  );

  const currencyHeaderExists = sanitizedHeaders.some(
    (header) =>
      header.id === settings.currencyHeaderId && header.type === "currency"
  );

  const sanitizedSettings: InvoiceTableSettings = {
    adminFee: clampAdminFee(settings.adminFee),
    showTotals: settings.showTotals && currencyHeaderExists,
    currencyHeaderId: currencyHeaderExists
      ? settings.currencyHeaderId
      : undefined,
  };

  return {
    headers: sanitizedHeaders,
    rows: numberedRows,
    settings: sanitizedSettings,
  };
};

const formatPreviewValue = (
  header: InvoiceHeader,
  value: string,
  rowIndex: number
): string => {
  if (header.type === "numbering") {
    return String(rowIndex + 1);
  }

  if (!value) return "";

  switch (header.type) {
    case "integer": {
      const parsed = parseInt(value.replace(/[^\d-]/g, ""), 10);
      return Number.isFinite(parsed) ? parsed.toLocaleString("en-NG") : value;
    }
    case "decimal": {
      const parsed = parseNumericValue(value);
      return Number.isFinite(parsed)
        ? new Intl.NumberFormat("en-NG", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(parsed)
        : value;
    }
    case "currency": {
      const parsed = parseNumericValue(value);
      return Number.isFinite(parsed)
        ? formatCurrencyValue(parsed, header.currencySymbol)
        : value;
    }
    case "date": {
      const dateValue = new Date(value);
      if (Number.isNaN(dateValue.getTime())) return value;
      return dateValue.toLocaleDateString("en-NG", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }
    default:
      return value;
  }
};

const buildSummaryRows = (
  totals: InvoiceTotals,
  settings: InvoiceTableSettings,
  currencySymbol: string
) => {
  const rows: Array<{ label: string; value: string }> = [
    {
      label: "Sub Total",
      value: formatCurrencyValue(totals.subTotal, currencySymbol),
    },
  ];

  if (settings.adminFee > 1 && totals.adminFee > 0) {
    rows.push({
      label: `Admin Fee (${settings.adminFee}%)`,
      value: formatCurrencyValue(totals.adminFee, currencySymbol),
    });
  }

  rows.push({
    label: `VAT (${DEFAULT_VAT_RATE}%)`,
    value: formatCurrencyValue(totals.vat, currencySymbol),
  });

  rows.push({
    label: "Grand Total",
    value: formatCurrencyValue(totals.grandTotal, currencySymbol),
  });

  return rows;
};

const renderInvoicePreview = (
  content: InvoiceContent,
  compact: boolean = false,
  summaryRows?: Array<{ label: string; value: string }>,
  currencyHeaderId?: string
) => {
  if (!content.headers.length) {
    return (
      <div className="invoice__preview__empty">
        <p>No headers configured yet</p>
      </div>
    );
  }

  const previewRowsBase = autoNumberRows(
    ensureAtLeastOneRow(
      ensureRowsShape(content.rows, content.headers),
      content.headers
    ),
    content.headers
  );

  type PreviewRow = {
    id: string;
    values: Record<string, string>;
    isSummary?: boolean;
  };

  const previewRows: PreviewRow[] = [
    ...previewRowsBase.map((row) => ({ id: row.id, values: row.values })),
  ];

  if (summaryRows?.length && currencyHeaderId) {
    const labelHeaderId =
      content.headers.find((header) => header.type === "text")?.id ??
      content.headers.find((header) => header.type === "currency")?.id ??
      content.headers[0]?.id;

    summaryRows.forEach((summary, index) => {
      const values = content.headers.reduce<Record<string, string>>(
        (acc, header) => {
          if (header.id === currencyHeaderId) {
            acc[header.id] = summary.value;
          } else if (header.id === labelHeaderId) {
            acc[header.id] = summary.label;
          } else if (header.type === "numbering") {
            acc[header.id] = "";
          } else {
            acc[header.id] = "";
          }
          return acc;
        },
        {}
      );

      previewRows.push({
        id: `summary-row-${index}`,
        values,
        isSummary: true,
      });
    });
  }

  const gridTemplate = content.headers
    .map((header) => `${Math.max(header.width || DEFAULT_COLUMN_WIDTH, 5)}fr`)
    .join(" ");

  return (
    <div
      className={`invoice__preview${
        compact ? " invoice__preview--compact" : ""
      }`}
    >
      <div
        className="invoice__preview__row invoice__preview__row--header"
        style={{ gridTemplateColumns: gridTemplate }}
      >
        {content.headers.map((header) => (
          <span
            key={header.id}
            title={header.label}
            className={header.type === "currency" ? "is-currency" : undefined}
          >
            {header.label || "—"}
          </span>
        ))}
      </div>

      {previewRows.length > 0 ? (
        previewRows.map((row, rowIndex) => (
          <div
            className={`invoice__preview__row${
              row.isSummary ? " invoice__preview__row--summary" : ""
            }`}
            key={row.id}
            style={{ gridTemplateColumns: gridTemplate }}
          >
            {content.headers.map((header) => (
              <span
                key={header.id}
                className={
                  header.type === "currency" ? "is-currency" : undefined
                }
              >
                {row.isSummary && header.type === "numbering"
                  ? ""
                  : formatPreviewValue(
                      header,
                      row.values?.[header.id] ?? "",
                      rowIndex
                    ) || "—"}
              </span>
            ))}
          </div>
        ))
      ) : (
        <div className="invoice__preview__row">
          <span>No rows added yet</span>
        </div>
      )}
    </div>
  );
};

const InvoiceContentCard: React.FC<InvoiceContentCardProps> = ({
  item,
  onClose,
  isEditing,
}) => {
  const { state, actions } = usePaperBoard();
  const { openDeskComponent, setSize } = useModal();

  const [headers, setHeaders] = useState<InvoiceHeader[]>([]);
  const [rows, setRows] = useState<InvoiceRow[]>([]);
  const [settings, setSettings] = useState<InvoiceTableSettings>({
    adminFee: 0,
    showTotals: false,
    currencyHeaderId: undefined,
  });
  const [draggedHeaderId, setDraggedHeaderId] = useState<string | null>(null);

  useEffect(() => {
    if (!isEditing) return;

    const normalized = normalizeInvoiceContent(item.content?.invoice);
    const initialRows = normalized.rows.length
      ? normalized.rows
      : ensureAtLeastOneRow([], normalized.headers);

    setHeaders(normalized.headers);
    setRows(
      autoNumberRows(
        ensureRowsShape(initialRows, normalized.headers),
        normalized.headers
      )
    );
    setSettings(normalized.settings);
  }, [isEditing, item.id, item.content?.invoice]);

  useEffect(() => {
    if (!isEditing) return;

    setRows((prevRows) => {
      const shaped = ensureRowsShape(prevRows, headers);
      return autoNumberRows(ensureAtLeastOneRow(shaped, headers), headers);
    });
  }, [headers, isEditing]);

  useEffect(() => {
    if (!isEditing) return;

    setSettings((prev) => {
      const currencyHeaders = headers.filter(
        (header) => header.type === "currency"
      );

      if (!currencyHeaders.length) {
        if (!prev.showTotals && prev.currencyHeaderId === undefined) {
          return prev;
        }

        return {
          ...prev,
          showTotals: false,
          currencyHeaderId: undefined,
        };
      }

      if (
        prev.currencyHeaderId &&
        currencyHeaders.some((header) => header.id === prev.currencyHeaderId)
      ) {
        return prev;
      }

      return {
        ...prev,
        currencyHeaderId: currencyHeaders[0]?.id,
      };
    });
  }, [headers, isEditing]);

  const currencyHeaders = useMemo(
    () => headers.filter((header) => header.type === "currency"),
    [headers]
  );

  const totalWidthPercent = useMemo(
    () =>
      Number(
        headers.reduce((sum, header) => sum + (header.width || 0), 0).toFixed(2)
      ),
    [headers]
  );

  const totalWidthDisplay = useMemo(
    () =>
      totalWidthPercent.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }),
    [totalWidthPercent]
  );

  const isWidthBalanced = useMemo(
    () => Math.abs(totalWidthPercent - 100) <= 0.1,
    [totalWidthPercent]
  );

  const reorderHeaders = useCallback(
    (current: InvoiceHeader[], sourceId: string, targetId: string) => {
      const updated = [...current];
      const fromIndex = updated.findIndex((header) => header.id === sourceId);
      const toIndex = updated.findIndex((header) => header.id === targetId);

      if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
        return current;
      }

      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    },
    []
  );

  const handleAddHeader = () => {
    const newHeader: InvoiceHeader = {
      id: crypto.randomUUID(),
      label: "",
      type: "text",
      width: DEFAULT_COLUMN_WIDTH,
    };

    setHeaders((prev) => [...prev, newHeader]);
  };

  const handleRemoveHeader = (headerId: string) => {
    setHeaders((prev) => prev.filter((header) => header.id !== headerId));
    setRows((prevRows) =>
      prevRows.map((row) => {
        const { [headerId]: _, ...rest } = row.values;
        return {
          ...row,
          values: rest,
        };
      })
    );
    setSettings((prev) =>
      prev.currencyHeaderId === headerId
        ? { ...prev, currencyHeaderId: undefined, showTotals: false }
        : prev
    );
  };

  const handleHeaderLabelChange = (headerId: string, label: string) => {
    setHeaders((prev) =>
      prev.map((header) =>
        header.id === headerId ? { ...header, label } : header
      )
    );
  };

  const handleHeaderTypeChange = (
    headerId: string,
    type: InvoiceHeaderType
  ) => {
    setHeaders((prev) =>
      prev.map((header) => {
        if (header.id !== headerId) return header;
        const next: InvoiceHeader = { ...header, type };
        if (type === "currency") {
          next.currencySymbol = header.currencySymbol || "₦";
        } else {
          delete next.currencySymbol;
        }
        return next;
      })
    );
  };

  const handleHeaderWidthChange = (headerId: string, value: string) => {
    const parsed = Number(value);
    setHeaders((prev) =>
      prev.map((header) =>
        header.id === headerId
          ? {
              ...header,
              width: Math.min(
                Math.max(
                  Number.isFinite(parsed) ? parsed : DEFAULT_COLUMN_WIDTH,
                  5
                ),
                100
              ),
            }
          : header
      )
    );
  };

  const handleCurrencySymbolChange = (headerId: string, symbol: string) => {
    setHeaders((prev) =>
      prev.map((header) =>
        header.id === headerId
          ? {
              ...header,
              currencySymbol: symbol.trim() || "₦",
            }
          : header
      )
    );
  };

  const handleAdminFeeChange = (value: string) => {
    const parsed = Number(value);
    setSettings((prev) => ({
      ...prev,
      adminFee: clampAdminFee(parsed),
    }));
  };

  const handleToggleTotals = (checked: boolean) => {
    if (checked && !currencyHeaders.length) return;
    setSettings((prev) => ({
      ...prev,
      showTotals: checked && currencyHeaders.length > 0,
    }));
  };

  const handleCurrencyColumnChange = (headerId: string) => {
    setSettings((prev) => ({
      ...prev,
      currencyHeaderId: headerId || undefined,
    }));
  };

  const handleRowsUpdate = (payload: unknown) => {
    const response = payload as { rows?: InvoiceRow[] };
    const nextRows = response?.rows ?? [];
    setRows((prev) => {
      const rowsToUse = nextRows.length ? nextRows : prev;
      const shaped = ensureRowsShape(rowsToUse, headers);
      return autoNumberRows(ensureAtLeastOneRow(shaped, headers), headers);
    });
  };

  const handleHeaderDragStart = (headerId: string) => {
    setDraggedHeaderId(headerId);
  };

  const handleHeaderDragOver = (
    event: React.DragEvent<HTMLDivElement>,
    targetId: string
  ) => {
    event.preventDefault();
    if (!draggedHeaderId || draggedHeaderId === targetId) return;

    setHeaders((prev) => reorderHeaders(prev, draggedHeaderId, targetId));
  };

  const handleHeaderDragEnd = () => {
    setDraggedHeaderId(null);
  };

  const handleManageRows = () => {
    if (!headers.length) return;
    setSize("lg");
    const blockState: InvoiceContent = {
      headers,
      rows,
      settings,
    };

    openDeskComponent(
      InvoiceContentCardModal,
      {
        title: "Manage Invoice Rows",
        type: "invoice",
        blockState,
        isUpdating: true,
        data: { rows },
        resolve: handleRowsUpdate,
      },
      "invoice",
      { rows }
    );
  };

  const previewContent = useMemo<InvoiceContent>(
    () => ({
      headers,
      rows,
      settings,
    }),
    [headers, rows, settings]
  );

  const previewTotals = useMemo(
    () => computeInvoiceTotals(previewContent, DEFAULT_VAT_RATE),
    [previewContent]
  );

  const previewCurrencyHeader = useMemo(
    () =>
      headers.find((header) => header.id === settings.currencyHeaderId) ??
      currencyHeaders[0],
    [headers, settings.currencyHeaderId, currencyHeaders]
  );

  const savedContent = useMemo(
    () => normalizeInvoiceContent(item.content?.invoice),
    [item]
  );

  const savedTotals = useMemo(
    () => computeInvoiceTotals(savedContent, DEFAULT_VAT_RATE),
    [savedContent]
  );

  const savedCurrencyHeader = useMemo(
    () =>
      savedContent.headers.find(
        (header) => header.id === savedContent.settings.currencyHeaderId
      ),
    [savedContent]
  );

  const isSaveDisabled = useMemo(() => {
    if (!headers.length) return true;

    const invalidLabel = headers.some((header) => !header.label.trim());
    const invalidWidth = headers.some((header) => header.width < 5);
    const totalsInvalid =
      settings.showTotals &&
      (!settings.currencyHeaderId ||
        !headers.some(
          (header) =>
            header.id === settings.currencyHeaderId &&
            header.type === "currency"
        ));

    return invalidLabel || invalidWidth || totalsInvalid;
  }, [headers, settings.showTotals, settings.currencyHeaderId]);

  const handleSave = () => {
    const payload = buildInvoiceContentForSave(headers, rows, settings);

    const updatedItem: ContentBlock = {
      ...item,
      content: {
        ...item.content,
        id: item.id,
        order: item.order,
        invoice: payload,
      } as SheetProps,
    };

    const newBody = state.body.map((bodyItem) =>
      bodyItem.id === item.id ? updatedItem : bodyItem
    );

    actions.setBody(newBody);
    onClose();
  };

  if (isEditing) {
    return (
      <div className="inline__content__card invoice__card">
        <div className="inline__card__header">
          <h5>Invoice Table Configuration</h5>
          <p>Define headers, column types, and table-level behaviours</p>
        </div>

        <div className="inline__card__content">
          <section className="invoice__section">
            <header className="section__header">
              <div>
                <h6>Headers</h6>
                <p>Set column labels, data types, and widths</p>
              </div>
              <div className="invoice__header__actions">
                <button
                  type="button"
                  className="btn__link"
                  onClick={handleAddHeader}
                >
                  <i className="ri-add-circle-line" />
                  Add Header
                </button>
              </div>
            </header>

            <div className="invoice__header__summary">
              <span className="invoice__badge invoice__badge--subtle">
                Total Width: {totalWidthDisplay}%
              </span>
              {headers.length > 0 && !isWidthBalanced && (
                <span className="invoice__header__hint">
                  Adjust columns so the total equals 100%
                </span>
              )}
            </div>

            <div className="invoice__headers__grid">
              {headers.map((header) => (
                <div
                  key={header.id}
                  className={`invoice__header__row${
                    draggedHeaderId === header.id ? " is-dragging" : ""
                  }`}
                  draggable
                  onDragStart={() => handleHeaderDragStart(header.id)}
                  onDragOver={(event) => handleHeaderDragOver(event, header.id)}
                  onDragEnd={handleHeaderDragEnd}
                >
                  <div
                    className="invoice__header__drag"
                    aria-label="Drag to reorder column"
                    title="Drag to reorder column"
                  >
                    <i className="ri-drag-move-2-line" />
                  </div>

                  <div className="invoice__header__field">
                    <label>Label</label>
                    <input
                      type="text"
                      className="form__input"
                      placeholder="Column label"
                      value={header.label}
                      onChange={(event) =>
                        handleHeaderLabelChange(header.id, event.target.value)
                      }
                    />
                  </div>

                  <div className="invoice__header__field invoice__header__field--type">
                    <label>Type</label>
                    <select
                      className="form__select"
                      value={header.type}
                      onChange={(event) =>
                        handleHeaderTypeChange(
                          header.id,
                          event.target.value as InvoiceHeaderType
                        )
                      }
                    >
                      {HEADER_TYPE_OPTIONS.map((option) => (
                        <option value={option.value} key={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="invoice__header__field invoice__header__field--width">
                    <label>Width (%)</label>
                    <input
                      type="number"
                      min={5}
                      max={100}
                      step={1}
                      className="form__input"
                      value={header.width}
                      onChange={(event) =>
                        handleHeaderWidthChange(header.id, event.target.value)
                      }
                    />
                  </div>

                  <div
                    className={`invoice__header__field invoice__header__field--symbol${
                      header.type !== "currency" ? " is-muted" : ""
                    }`}
                  >
                    <label>Currency Symbol</label>
                    {header.type === "currency" ? (
                      <input
                        type="text"
                        maxLength={3}
                        className="form__input"
                        value={header.currencySymbol ?? "₦"}
                        onChange={(event) =>
                          handleCurrencySymbolChange(
                            header.id,
                            event.target.value
                          )
                        }
                      />
                    ) : (
                      <div className="invoice__header__placeholder">—</div>
                    )}
                  </div>

                  <button
                    type="button"
                    className="btn__icon btn__danger invoice__header__remove"
                    onClick={() => handleRemoveHeader(header.id)}
                    aria-label="Remove header"
                    disabled={headers.length === 1}
                    title="Remove column"
                  >
                    ×
                  </button>
                </div>
              ))}

              {!headers.length && (
                <div className="invoice__blank__state">
                  <p>No headers added yet. Click “Add Header” to begin.</p>
                </div>
              )}
            </div>
          </section>

          <section className="invoice__section">
            <header className="section__header">
              <div>
                <h6>Table Settings</h6>
                <p>Configure totals, admin fee, and currency behaviour</p>
              </div>
            </header>

            <div className="invoice__settings__grid">
              <label className="invoice__toggle">
                <i className="ri-function-line invoice__toggle__icon" />
                <input
                  type="checkbox"
                  checked={settings.showTotals}
                  onChange={(event) => handleToggleTotals(event.target.checked)}
                  disabled={!currencyHeaders.length}
                />
                <span className="invoice__toggle__label">
                  Show totals for currency column
                </span>
              </label>

              <div className="invoice__settings__field">
                <label>Currency Column</label>
                <select
                  className="form__select"
                  value={settings.currencyHeaderId ?? ""}
                  onChange={(event) =>
                    handleCurrencyColumnChange(event.target.value)
                  }
                  disabled={!currencyHeaders.length}
                >
                  {!currencyHeaders.length && (
                    <option value="">Add a currency header first</option>
                  )}
                  {currencyHeaders.map((header) => (
                    <option value={header.id} key={header.id}>
                      {header.label || "Unnamed column"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="invoice__settings__field">
                <label>Admin Fee (%)</label>
                <input
                  type="number"
                  className="form__input"
                  min={0}
                  max={100}
                  value={settings.adminFee}
                  onChange={(event) => handleAdminFeeChange(event.target.value)}
                />
                <small>Optional. Applied on subtotal before VAT.</small>
              </div>
            </div>
          </section>

          <section className="invoice__section">
            <header className="section__header">
              <div>
                <h6>Rows</h6>
                <p>Manage table data via the modal editor</p>
              </div>
              <button
                type="button"
                className="invoice__rows__action"
                onClick={handleManageRows}
                disabled={!headers.length}
              >
                <i className="ri-table-line" />
                Manage Rows
              </button>
            </header>

            <div className="invoice__rows__meta">
              <span className="invoice__badge">
                {rows.length} {rows.length === 1 ? "row" : "rows"}
              </span>
              {settings.showTotals && previewCurrencyHeader && (
                <span className="invoice__rows__hint">
                  Totals based on{" "}
                  <strong>{previewCurrencyHeader.label || "currency"}</strong>
                </span>
              )}
            </div>

            {renderInvoicePreview(
              previewContent,
              true,
              settings.showTotals && previewTotals && previewCurrencyHeader
                ? buildSummaryRows(
                    previewTotals,
                    settings,
                    previewCurrencyHeader.currencySymbol ?? "₦"
                  )
                : undefined,
              settings.currencyHeaderId
            )}
          </section>

          <div className="inline__card__actions">
            <button className="btn__secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn__primary"
              onClick={handleSave}
              disabled={isSaveDisabled}
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="inline__card__content">
      {savedContent.headers.length ? (
        renderInvoicePreview(
          savedContent,
          false,
          savedContent.settings.showTotals && savedTotals && savedCurrencyHeader
            ? buildSummaryRows(
                savedTotals,
                savedContent.settings,
                savedCurrencyHeader.currencySymbol ?? "₦"
              )
            : undefined,
          savedContent.settings.currencyHeaderId
        )
      ) : (
        <p className="invoice__empty">No invoice rows configured yet</p>
      )}
    </div>
  );
};

export default InvoiceContentCard;
