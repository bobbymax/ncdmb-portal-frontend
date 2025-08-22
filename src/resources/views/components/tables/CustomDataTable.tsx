import DataTable, {
  ConditionalArray,
  Raw,
} from "../../../../app/Support/DataTable";
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import Pagination from "./Pagination";
import TextInput from "../forms/TextInput";
import Button from "../forms/Button";
import TextInputWithIcon from "../forms/TextInputWithIcon";
import TableButton from "./TableButton";
import Alert from "app/Support/Alert";
import { generateShortUniqueString } from "app/Support/Helpers";

export interface ColumnData {
  label: string;
  accessor: string;
  type: "text" | "currency" | "date" | "status" | "badge" | "field" | "bool";
  format?: string;
  simplify?: (data: unknown) => void;
}

export interface ButtonsProp {
  label:
    | "update"
    | "destroy"
    | "external"
    | "block"
    | "verify"
    | "view"
    | "schedule"
    | "print"
    | "manage"
    | "payments"
    | "track"
    | "deactivate"
    | "builder"
    | "configurator"
    | "configuration";
  variant: "success" | "info" | "warning" | "danger" | "dark";
  icon?: string;
  conditions: ConditionalArray[];
  operator: "and" | "or";
  display?: string;
  url?: string;
}

export interface DataTableProps {
  pageName: string;
  collection: Record<string, unknown>[];
  columns: ColumnData[];
  manage?: (raw: Raw, label: string) => void;
  buttons: ButtonsProp[];
  exportable?: boolean;
  addData?: () => void;
  tag: string;
  exportBttn?: string;
  bttnVaraint?: "success" | "info" | "warning" | "danger" | "dark";
  onExportData?: (data: Record<string, unknown>[]) => void;
}

// Enhanced types for better type safety
export interface TableRow extends Record<string, unknown> {
  id?: string | number;
}

export interface FilterState {
  [key: string]: string;
}

const CustomDataTable = ({
  pageName,
  collection,
  columns,
  manage,
  buttons,
  exportable = false,
  addData,
  tag,
  exportBttn,
  bttnVaraint,
  onExportData,
}: DataTableProps) => {
  const [tableData, setTableData] = useState<TableRow[]>([]);
  const [filteredData, setFilteredData] = useState<TableRow[]>([]);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [filters, setFilters] = useState<FilterState>({});
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Optimized DataTable manager - only recreate when columns or pageSize change
  const manager = useMemo(
    () => new DataTable(collection, columns, pageSize),
    [columns, pageSize] // Removed collection dependency
  );

  // Debounced search function
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (value: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          setSearchTerm(value);
          setPage(1); // Reset to first page on search
        }, 300); // 300ms debounce
      };
    })(),
    []
  );

  // Enhanced export function - exports filtered data
  const exportData = useCallback(() => {
    Alert.flash("Download Excel File", "info", "Perform this action").then(
      (result) => {
        if (result.isConfirmed) {
          try {
            // Export filtered data instead of original collection
            const dataToExport =
              filteredData.length > 0 ? filteredData : collection;
            manager.export(dataToExport, generateShortUniqueString());
            if (onExportData) {
              onExportData(dataToExport);
            }
          } catch (error) {
            console.error("Export failed:", error);
            Alert.error(
              "Export Failed",
              "Failed to export data. Please try again."
            );
          }
        }
      }
    );
  }, [filteredData, collection, manager, onExportData]);

  // Memoized button generation
  const generateButtons = useCallback(
    (raw: Raw) => {
      return (
        <div className="flex column gap-sm">
          {buttons.map((bttn, i) => (
            <TableButton
              key={i}
              raw={raw}
              button={bttn}
              action={() => (manage ? manage(raw, bttn.label) : {})}
            />
          ))}
        </div>
      );
    },
    [buttons, manage]
  );

  // Enhanced data processing with error handling and loading states
  useEffect(() => {
    const processData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Update manager data when collection changes
        manager.data = collection;

        // Get filtered and paginated data
        const updatedData = manager.paginate(page, filters, searchTerm);
        setTableData(updatedData);

        // Get total filtered data for pagination
        const totalFiltered = manager.applyFilters(collection, filters);
        const searchFiltered = manager.applySearch(totalFiltered, searchTerm);
        setFilteredData(searchFiltered);
      } catch (err) {
        console.error("Data processing error:", err);
        setError("Failed to process data. Please refresh the page.");
        setTableData([]);
        setFilteredData([]);
      } finally {
        setIsLoading(false);
      }
    };

    processData();
  }, [page, pageSize, filters, searchTerm, collection, manager]);

  // Enhanced search handler with debouncing
  const handleSearch = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      debouncedSearch(e.target.value);
    },
    [debouncedSearch]
  );

  // Enhanced page change handler
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  // Enhanced filter change handler with proper typing
  const handleFilterChange = useCallback((column: string, value: string) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [column]: value,
    }));
    setPage(1); // Reset to the first page on filter change
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchTerm("");
    setPage(1);
  }, []);

  return (
    <div className="table-container custom-card file__card">
      {/* Error Display */}
      {error && (
        <div className="error-message mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="table-header mb-4 flex between align">
        <h1
          className="resource-header"
          style={{ fontWeight: 500, letterSpacing: 1 }}
        >
          {pageName}
        </h1>
        {tag !== "" && (
          <Button
            label={tag}
            icon="ri-add-large-fill"
            variant="success"
            handleClick={addData}
            size="sm"
          />
        )}
      </div>

      <div className="top-section mb-4 flex align between">
        <div
          className="search-container"
          style={{ flexGrow: 1, maxWidth: "400px" }}
        >
          <TextInputWithIcon
            placeholder="Search records..."
            value={searchTerm}
            onChange={handleSearch}
            size="lg"
            icon="search"
            name="table-search"
          />
        </div>
        <div className="button-section flex gap-2">
          {/* Clear Filters Button */}
          {(Object.keys(filters).length > 0 || searchTerm) && (
            <Button
              label="Clear Filters"
              icon="ri-refresh-line"
              variant="info"
              handleClick={clearFilters}
              size="sm"
            />
          )}
          <Button
            label={`${exportBttn ?? "Export to Excel"}`}
            icon="ri-file-excel-2-line"
            variant={`${bttnVaraint ?? "success"}`}
            handleClick={exportData}
            isDisabled={filteredData?.length < 1 || !exportable}
            size="sm"
          />
        </div>
      </div>
      {/* Loading State */}
      {isLoading && (
        <div className="loading-state mb-4 p-8 text-center">
          <div className="loading-spinner mb-2">
            <i className="ri-loader-4-line animate-spin text-2xl text-blue-500"></i>
          </div>
          <p className="text-gray-600">Loading data...</p>
        </div>
      )}

      {/* Table Content */}
      {!isLoading && (
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col.accessor}>
                    <span>{col.label}</span>
                    <TextInput
                      placeholder={`Filter ${col.label}`}
                      value={filters[col.accessor] || ""}
                      onChange={(e) =>
                        handleFilterChange(col.accessor, e.target.value)
                      }
                      size="sm"
                      width={85}
                    />
                  </th>
                ))}
                {manage !== undefined && (
                  <th style={{ maxWidth: "10%", width: "10%" }}>
                    <span>Actions</span>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {tableData.length > 0 ? (
                tableData.map((row, rowIndex) => (
                  <tr key={row.id || rowIndex}>
                    {columns.map((col) => (
                      <td key={col.accessor}>
                        {formatCellValue(row[col.accessor], col.type)}
                      </td>
                    ))}
                    {manage !== undefined && (
                      <td style={{ maxWidth: "10%", width: "10%" }}>
                        {generateButtons(row)}
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length + (manage ? 1 : 0)}
                    className="text-center py-8"
                  >
                    <div className="no-data-state">
                      <i className="ri-database-2-line text-4xl text-gray-400 mb-2"></i>
                      <p className="text-gray-500">
                        {searchTerm || Object.keys(filters).length > 0
                          ? "No results found for your search criteria."
                          : "No data available."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Enhanced Pagination with filtered data count */}
      {!isLoading && (
        <Pagination
          totalRecords={filteredData.length}
          pageSize={pageSize}
          currentPage={page}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

// Helper function to format cell values based on column type
const formatCellValue = (value: unknown, type: ColumnData["type"]): string => {
  if (value === null || value === undefined) return "N/A";

  const stringValue = String(value);

  switch (type) {
    case "currency":
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(Number(value) || 0);

    case "date":
      return new Date(stringValue).toLocaleDateString();

    case "status":
      return stringValue.charAt(0).toUpperCase() + stringValue.slice(1);

    case "bool":
      return value ? "Yes" : "No";

    default:
      return stringValue;
  }
};

export default CustomDataTable;
