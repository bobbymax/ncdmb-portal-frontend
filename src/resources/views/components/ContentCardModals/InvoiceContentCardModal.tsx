import React, { FormEvent, useEffect, useMemo } from "react";
import { DeskComponentModalProps, useModal } from "app/Context/ModalContext";
import {
  InvoiceContent,
  InvoiceHeader,
  InvoiceHeaderType,
  InvoiceRow,
  autoNumberRows,
  ensureRowsShape,
} from "../ContentCards/InvoiceContent.types";

const sanitizeCellValue = (type: InvoiceHeaderType, value: string): string => {
  switch (type) {
    case "integer":
      return value.replace(/[^\d-]/g, "");
    case "decimal":
    case "currency": {
      const sanitized = value.replace(/[^0-9.-]/g, "");
      const segments = sanitized.split(".");
      if (segments.length <= 2) return sanitized;
      const [head, ...tail] = segments;
      return `${head}.${tail.join("")}`;
    }
    case "date":
      return value.slice(0, 10);
    default:
      return value;
  }
};

const InvoiceContentCardModal: React.FC<DeskComponentModalProps<"invoice">> = ({
  title,
  type,
  blockState,
  resolve,
}) => {
  const { getModalState, updateModalState, closeModal } = useModal();
  const headers = (blockState as InvoiceContent | undefined)?.headers ?? [];
  const state = getModalState(type) as { rows?: InvoiceRow[] };

  const initialRows = useMemo(
    () =>
      autoNumberRows(
        ensureRowsShape(
          (blockState as InvoiceContent | undefined)?.rows ?? [],
          headers
        ),
        headers
      ),
    [blockState, headers]
  );

  const rows = state.rows
    ? autoNumberRows(ensureRowsShape(state.rows, headers), headers)
    : initialRows;

  useEffect(() => {
    if (!state.rows) {
      updateModalState(type, { rows: initialRows });
    }
  }, [state.rows, initialRows, type, updateModalState]);

  const handleAddRow = () => {
    const newRow: InvoiceRow = {
      id: crypto.randomUUID(),
      values: headers.reduce<Record<string, string>>((acc, header) => {
        acc[header.id] =
          header.type === "numbering" ? String(rows.length + 1) : "";
        return acc;
      }, {}),
    };

    updateModalState(type, {
      rows: autoNumberRows([...rows, newRow], headers),
    });
  };

  const handleRemoveRow = (rowId: string) => {
    const filtered = rows.filter((row) => row.id !== rowId);
    updateModalState(type, {
      rows: autoNumberRows(filtered, headers),
    });
  };

  const handleUpdateCell = (
    rowId: string,
    header: InvoiceHeader,
    nextValue: string
  ) => {
    if (header.type === "numbering") return;

    const sanitized = sanitizeCellValue(header.type, nextValue);
    const updatedRows = rows.map((row) =>
      row.id === rowId
        ? {
            ...row,
            values: {
              ...row.values,
              [header.id]: sanitized,
            },
          }
        : row
    );

    updateModalState(type, {
      rows: autoNumberRows(updatedRows, headers),
    });
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const payload = autoNumberRows(rows, headers);
    resolve({ rows: payload }, "update");
    closeModal();
  };

  const renderCell = (
    row: InvoiceRow,
    header: InvoiceHeader,
    rowIndex: number
  ) => {
    const value = row.values?.[header.id] ?? "";

    switch (header.type) {
      case "numbering":
        return (
          <span className="invoice__modal__numbering">{rowIndex + 1}</span>
        );
      case "date":
        return (
          <input
            type="date"
            className="form__input"
            value={value}
            onChange={(event) =>
              handleUpdateCell(row.id, header, event.target.value)
            }
          />
        );
      case "integer":
        return (
          <input
            type="number"
            className="form__input"
            value={value}
            onChange={(event) =>
              handleUpdateCell(row.id, header, event.target.value)
            }
          />
        );
      case "decimal":
      case "currency":
        return (
          <input
            type="number"
            step="0.01"
            className="form__input"
            value={value}
            onChange={(event) =>
              handleUpdateCell(row.id, header, event.target.value)
            }
          />
        );
      default:
        return (
          <input
            type="text"
            className="form__input"
            value={value}
            onChange={(event) =>
              handleUpdateCell(row.id, header, event.target.value)
            }
          />
        );
    }
  };

  return (
    <form className="invoice__modal" onSubmit={handleSubmit}>
      <div className="invoice__modal__header">
        <div>
          <h5>{title}</h5>
          <p>Populate row values for the invoice table</p>
        </div>
        <button
          type="button"
          className="btn__icon"
          onClick={closeModal}
          aria-label="Close modal"
        >
          ×
        </button>
      </div>

      <div className="invoice__modal__body">
        {headers.length ? (
          <>
            <div className="invoice__modal__toolbar">
              <span className="invoice__badge">
                {rows.length} {rows.length === 1 ? "row" : "rows"}
              </span>
              <button
                type="button"
                className="btn__secondary"
                onClick={handleAddRow}
              >
                Add Row
              </button>
            </div>

            <div className="invoice__modal__table">
              <div className="invoice__modal__table__header">
                {headers.map((header) => (
                  <span key={header.id}>{header.label || "Column"}</span>
                ))}
                <span className="invoice__modal__actions__label">Actions</span>
              </div>

              {rows.length ? (
                rows.map((row, rowIndex) => (
                  <div className="invoice__modal__row" key={row.id}>
                    {headers.map((header) => (
                      <div
                        className="invoice__modal__cell"
                        key={`${row.id}-${header.id}`}
                      >
                        {renderCell(row, header, rowIndex)}
                      </div>
                    ))}
                    <div className="invoice__modal__cell invoice__modal__cell--actions">
                      <button
                        type="button"
                        className="btn__icon btn__danger"
                        onClick={() => handleRemoveRow(row.id)}
                        aria-label="Remove row"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="invoice__modal__empty">
                  <p>No rows yet. Click “Add Row” to insert the first entry.</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="invoice__modal__empty">
            <p>Add headers to the invoice before managing row values.</p>
          </div>
        )}
      </div>

      <div className="invoice__modal__footer">
        <button
          type="button"
          className="btn__secondary"
          onClick={closeModal}
          aria-label="Cancel"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn__primary"
          disabled={!headers.length}
        >
          Save Rows
        </button>
      </div>
    </form>
  );
};

export default InvoiceContentCardModal;
