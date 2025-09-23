import React, { useCallback, useMemo, useState } from "react";
import { createEditor, Descendant } from "slate";
import { Slate, Editable, withReact } from "slate-react";
import { withHistory } from "slate-history";
import {
  withTables,
  withImages,
  withFileAttachments,
  withLinks,
  withDatabaseRecords,
  withLists,
} from "../utils";
import Toolbar from "./Toolbar";
import Elements from "./Elements";
import Leaf from "./Leaf";
import { CustomEditor, CustomElement, CustomText } from "../types";
import "../styles.css";

// Default empty document structure
const createDefaultDocument = (): Descendant[] => [
  {
    type: "paragraph",
    children: [{ text: "" }],
  },
];

// Validate document structure
const validateDocument = (doc: any): Descendant[] => {
  if (!Array.isArray(doc) || doc.length === 0) {
    return createDefaultDocument();
  }

  // Ensure each block has children with at least one text node
  return doc.map((block: any) => {
    if (
      !block.children ||
      !Array.isArray(block.children) ||
      block.children.length === 0
    ) {
      return {
        type: block.type || "paragraph",
        children: [{ text: "" }],
      };
    }

    // Ensure children have text nodes
    const validatedChildren = block.children.map((child: any) => {
      if (typeof child === "string") {
        return { text: child };
      }
      if (child.text !== undefined) {
        return child;
      }
      return { text: "" };
    });

    return {
      ...block,
      children: validatedChildren,
    };
  });
};

// Enhanced document validation to prevent corrupted structures
const validateDocumentStructure = (doc: any): Descendant[] => {
  try {
    const validated = validateDocument(doc);

    // Additional validation for tables
    const cleanDoc = validated.map((block: any) => {
      if (block.type === "table") {
        // Ensure table has valid structure
        if (!block.children || !Array.isArray(block.children)) {
          return { type: "paragraph", children: [{ text: "" }] };
        }

        // Clean table rows
        const cleanRows = block.children
          .filter((row: any) => row.type === "table-row")
          .map((row: any) => {
            if (!row.children || !Array.isArray(row.children)) {
              return { type: "table-row", children: [] };
            }

            // Clean table cells
            const cleanCells = row.children
              .filter((cell: any) => cell.type === "table-cell")
              .map((cell: any) => {
                // Ensure cells don't contain nested tables
                if (cell.children && Array.isArray(cell.children)) {
                  const cleanCellChildren = cell.children.filter(
                    (child: any) =>
                      child.type !== "table" &&
                      child.type !== "table-row" &&
                      child.type !== "table-cell"
                  );

                  if (cleanCellChildren.length === 0) {
                    cleanCellChildren.push({ text: "" });
                  }

                  return {
                    ...cell,
                    children: cleanCellChildren,
                  };
                }

                return { ...cell, children: [{ text: "" }] };
              });

            return { ...row, children: cleanCells };
          });

        return { ...block, children: cleanRows };
      }

      return block;
    });

    return cleanDoc;
  } catch (error) {
    // Error validating document structure
    return createDefaultDocument();
  }
};

interface EditorProps {
  value?: Descendant[];
  onChange?: (value: Descendant[]) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  onFileUpload?: (file: File) => Promise<string | null>;
  onDatabaseQuery?: (query: string) => Promise<any[]>;
  onSelectionChange?: (selection: any) => void;
  onValueChange?: (value: Descendant[]) => void;
}

const Editor: React.FC<EditorProps> = ({
  value = [],
  onChange,
  placeholder = "Start typing...",
  className = "",
  style = {},
  onFileUpload,
  onDatabaseQuery,
  onSelectionChange,
  onValueChange,
}) => {
  // Ensure we have valid content
  const initialValue = useMemo(() => {
    try {
      return validateDocumentStructure(value);
    } catch (error) {
      // Error validating initial value
      return createDefaultDocument();
    }
  }, [value]);

  const editor = useMemo(
    () =>
      withDatabaseRecords(
        withLinks(
          withFileAttachments(
            withImages(withTables(withHistory(withReact(createEditor()))))
          )
        )
      ),
    []
  );

  const [showTableModal, setShowTableModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showDatabaseModal, setShowDatabaseModal] = useState(false);
  const [hasError, setHasError] = useState(false);

  const toolbarConfig = {
    showFormatting: true,
    showLists: true,
    showTables: true,
    showImages: true,
    showFiles: true,
    showLinks: true,
    showDatabase: true,
    showAlignment: true,
    showColors: false,
    showFontSize: true,
  };

  const handleChange = useCallback(
    (newValue: Descendant[]) => {
      try {
        // Validate the new value before calling onChange
        const validatedValue = validateDocumentStructure(newValue);

        if (onChange) {
          onChange(validatedValue);
        }

        if (onValueChange) {
          onValueChange(validatedValue);
        }

        setHasError(false);
      } catch (error) {
        // Error in handleChange
        setHasError(true);

        // Fallback to safe content
        const safeValue = createDefaultDocument();
        if (onChange) {
          onChange(safeValue);
        }
      }
    },
    [onChange, onValueChange]
  );

  const handleInsertTable = useCallback(
    async (rows: number, cols: number) => {
      try {
        if (hasError) {
          // Cannot insert table while document has errors
          return;
        }

        const { insertTable } = await import("../utils");
        insertTable(editor, rows, cols);
        setShowTableModal(false);
      } catch (error) {
        // Error inserting table
        alert("Failed to insert table. Please try again.");
      }
    },
    [editor, hasError]
  );

  const handleInsertImage = useCallback(
    async (url: string, alt?: string) => {
      const { insertImage } = await import("../utils");
      insertImage(editor, url, alt);
      setShowImageModal(false);
    },
    [editor]
  );

  const handleInsertFile = useCallback(
    async (file: File) => {
      if (onFileUpload) {
        const url = await onFileUpload(file);
        if (url) {
          const { insertFileAttachment } = await import("../utils");
          insertFileAttachment(editor, {
            id: Date.now().toString(),
            name: file.name,
            type: file.type,
            size: file.size,
            url,
            uploadedAt: new Date().toISOString(),
          });
        }
      }
      setShowFileModal(false);
    },
    [editor, onFileUpload]
  );

  const handleInsertLink = useCallback(
    async (url: string, text: string) => {
      const { insertLink } = await import("../utils");
      insertLink(editor, url, text);
      setShowLinkModal(false);
    },
    [editor]
  );

  const handleInsertDatabaseRecord = useCallback(
    async (record: any) => {
      const { insertDatabaseRecord } = await import("../utils");
      insertDatabaseRecord(editor, record);
      setShowDatabaseModal(false);
    },
    [editor]
  );

  const renderElement = useCallback(
    (props: any) => <Elements {...props} />,
    []
  );

  const renderLeaf = useCallback((props: any) => <Leaf {...props} />, []);

  return (
    <div className={`rich-text-editor ${className}`} style={style}>
      {hasError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Document structure error detected
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  The document structure has been corrupted. Click
                  &quot;Recover&quot; to restore a clean document.
                </p>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => {
                    const safeValue = createDefaultDocument();
                    if (onChange) {
                      onChange(safeValue);
                    }
                    setHasError(false);
                  }}
                  className="bg-red-100 text-red-800 px-3 py-1 rounded-md text-sm font-medium hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Recover Document
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Slate
        editor={editor}
        initialValue={initialValue}
        onChange={handleChange}
      >
        <Toolbar
          config={toolbarConfig}
          onInsertTable={() => {
            if (hasError) {
              alert(
                "Please recover the document first before inserting tables."
              );
              return;
            }
            setShowTableModal(true);
          }}
          onInsertImage={() => setShowImageModal(true)}
          onInsertFile={() => setShowFileModal(true)}
          onInsertLink={() => setShowLinkModal(true)}
          onInsertDatabaseRecord={() => setShowDatabaseModal(true)}
        />
        <div className="editor-content">
          <Editable
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            placeholder={placeholder}
            spellCheck
            autoFocus
          />
        </div>
      </Slate>

      {/* Modals - only render when needed */}
      {showTableModal && (
        <TableInsertModal
          onClose={() => setShowTableModal(false)}
          onInsert={(params: { rows: number; cols: number }) => {
            handleInsertTable(params.rows, params.cols);
          }}
        />
      )}

      {showImageModal && (
        <ImageInsertModal
          onClose={() => setShowImageModal(false)}
          onInsert={(params: { url: string; alt?: string }) => {
            handleInsertImage(params.url, params.alt);
          }}
        />
      )}

      {showFileModal && (
        <FileInsertModal
          onClose={() => setShowFileModal(false)}
          onFileSelect={handleInsertFile}
          onFileUpload={onFileUpload}
        />
      )}

      {showLinkModal && (
        <LinkInsertModal
          onClose={() => setShowLinkModal(false)}
          onInsert={(params: { url: string; text: string }) => {
            handleInsertLink(params.url, params.text);
          }}
        />
      )}

      {showDatabaseModal && (
        <DatabaseInsertModal
          onClose={() => setShowDatabaseModal(false)}
          onInsert={handleInsertDatabaseRecord}
          onDatabaseQuery={onDatabaseQuery}
        />
      )}
    </div>
  );
};

// Placeholder modal components - these would be implemented separately
const TableInsertModal: React.FC<{
  onClose: () => void;
  onInsert: (params: { rows: number; cols: number }) => void;
}> = ({ onClose, onInsert }) => {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [hoveredRows, setHoveredRows] = useState(0);
  const [hoveredCols, setHoveredCols] = useState(0);

  const handleInsert = () => {
    onInsert({ rows, cols });
  };

  const maxRows = 10;
  const maxCols = 10;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 table-modal-overlay">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 table-modal-content">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Insert Table</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Table Size Inputs */}
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of columns
                </label>
                <input
                  type="number"
                  min="1"
                  max={maxCols}
                  value={cols}
                  onChange={(e) =>
                    setCols(
                      Math.min(
                        maxCols,
                        Math.max(1, parseInt(e.target.value) || 1)
                      )
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of rows
                </label>
                <input
                  type="number"
                  min="1"
                  max={maxRows}
                  value={rows}
                  onChange={(e) =>
                    setRows(
                      Math.min(
                        maxRows,
                        Math.max(1, parseInt(e.target.value) || 1)
                      )
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Table Preview */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Table size
            </label>
            <div className="border border-gray-300 rounded-md p-4 bg-gray-50">
              <div
                className="grid gap-1 table-preview-grid"
                style={{
                  gridTemplateColumns: `repeat(${Math.min(
                    cols,
                    maxCols
                  )}, 1fr)`,
                  gridTemplateRows: `repeat(${Math.min(rows, maxRows)}, 1fr)`,
                }}
              >
                {Array.from(
                  { length: Math.min(rows, maxRows) },
                  (_, rowIndex) =>
                    Array.from(
                      { length: Math.min(cols, maxCols) },
                      (_, colIndex) => (
                        <div
                          key={`${rowIndex}-${colIndex}`}
                          className={`w-8 h-8 border border-gray-300 transition-colors table-preview-cell ${
                            rowIndex < hoveredRows && colIndex < hoveredCols
                              ? "bg-blue-500 border-blue-600"
                              : "bg-white"
                          }`}
                          onMouseEnter={() => {
                            setHoveredRows(rowIndex + 1);
                            setHoveredCols(colIndex + 1);
                          }}
                          onMouseLeave={() => {
                            setHoveredRows(0);
                            setHoveredCols(0);
                          }}
                        />
                      )
                    )
                )}
              </div>
              <div className="text-center mt-2 text-sm text-gray-600">
                {cols} × {rows} table
              </div>
            </div>
          </div>

          {/* Quick Size Buttons */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick size
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { rows: 2, cols: 2, label: "2×2" },
                { rows: 3, cols: 3, label: "3×3" },
                { rows: 4, cols: 4, label: "4×4" },
                { rows: 3, cols: 5, label: "3×5" },
                { rows: 5, cols: 3, label: "5×3" },
                { rows: 6, cols: 6, label: "6×6" },
              ].map((size) => (
                <button
                  key={`${size.rows}-${size.cols}`}
                  onClick={() => {
                    setRows(size.rows);
                    setCols(size.cols);
                  }}
                  className={`px-3 py-2 text-sm border rounded-md transition-colors quick-size-button ${
                    rows === size.rows && cols === size.cols
                      ? "bg-blue-500 text-white border-blue-500 active"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              onClick={handleInsert}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Insert Table
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ImageInsertModal: React.FC<{
  onClose: () => void;
  onInsert: (params: { url: string; alt?: string }) => void;
}> = () => <div>Image Modal</div>;

const FileInsertModal: React.FC<{
  onClose: () => void;
  onFileSelect: (file: File) => void;
  onFileUpload?: (file: File) => Promise<string | null>;
}> = () => <div>File Modal</div>;

const LinkInsertModal: React.FC<{
  onClose: () => void;
  onInsert: (params: { url: string; text: string }) => void;
}> = () => <div>Link Modal</div>;

const DatabaseInsertModal: React.FC<{
  onClose: () => void;
  onInsert: (record: any) => void;
  onDatabaseQuery?: (query: string) => Promise<any[]>;
}> = () => <div>Database Modal</div>;

export default Editor;
