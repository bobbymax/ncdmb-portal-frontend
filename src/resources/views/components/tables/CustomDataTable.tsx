/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import DataTable, {
  ConditionalArray,
  Raw,
} from "../../../../app/Support/DataTable";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
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
    | "deactivate";
  variant: "success" | "info" | "warning" | "danger" | "dark";
  icon?: string;
  conditions: ConditionalArray[];
  operator: "and" | "or";
  display?: string;
  url?: string;
}

export interface DataTableProps {
  pageName: string;
  collection: Record<string, any>[];
  columns: ColumnData[];
  manage?: (raw: Raw, label: string) => void;
  buttons: ButtonsProp[];
  exportable?: boolean;
  addData?: () => void;
  tag: string;
  exportBttn?: string;
  bttnVaraint?: "success" | "info" | "warning" | "danger" | "dark";
  onExportData?: (data: Record<string, any>[]) => void;
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
  const [tableData, setTableData] = useState<Record<string, any>[]>([]);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [searchTerm, setSearchTerm] = useState<string>("");

  const manager = useMemo(
    () => new DataTable(collection, columns, pageSize),
    [columns, pageSize, collection]
  );

  // Instantiate DataManager with initial data
  // const dataManager = new TableDataManager(data, columns, pageSize);

  const exportData = () => {
    Alert.flash("Download Excel File", "info", "Perform this action").then(
      (result) => {
        if (result.isConfirmed) {
          manager.export(collection, generateShortUniqueString());
          if (onExportData) {
            onExportData(collection);
          }
        }
      }
    );
  };

  const generateButtons = (raw: Raw) => {
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
  };

  useEffect(() => {
    const updatedData = manager.paginate(page, filters, searchTerm);
    setTableData(updatedData);
  }, [page, pageSize, filters, searchTerm, collection]);

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to the first page on search
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleFilterChange = (column: string, value: any) => {
    setFilters((prevFilters) => ({ ...prevFilters, [column]: value }));
    setPage(1); // Reset to the first page on filter change
  };

  return (
    <div className="table-container">
      <div className="table-header mb-4 flex between align">
        <h1
          className="resource-header"
          style={{ fontWeight: 500, letterSpacing: 1 }}
        >
          {pageName}
        </h1>
        <Button
          label={tag}
          icon="ri-add-large-fill"
          variant="info"
          handleClick={addData}
        />
      </div>
      <div className="top-section mb-4 flex center-align space-between">
        <div className="search-container" style={{ flexGrow: 1 }}>
          <TextInputWithIcon
            placeholder="Search"
            value={searchTerm}
            onChange={handleSearch}
            size="md"
            icon="ri-search-line"
          />
        </div>
        <div className="button-section">
          <Button
            label={`${exportBttn ?? "Export to Excel"}`}
            icon="ri-file-excel-2-line"
            variant={`${bttnVaraint ?? "success"}`}
            handleClick={() => exportData()}
            isDisabled={collection?.length < 1 || !exportable}
          />
        </div>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.accessor}>
                  <span>{col.label}</span>
                  <TextInput
                    placeholder={`Filter ${col.label}`}
                    onChange={(e) =>
                      handleFilterChange(col.accessor, e.target.value)
                    }
                    size="sm"
                    width={85}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.length > 0 ? (
              tableData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((col) => (
                    <td key={col.accessor}>{row[col.accessor] ?? "N/A"}</td>
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
                <td colSpan={columns.length + 1} className="text-danger">
                  No Data Found!!!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination
        totalRecords={collection.length}
        pageSize={pageSize}
        currentPage={page}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default CustomDataTable;
