import { ColumnData } from "resources/views/components/tables/CustomDataTable";
import * as XLSX from "xlsx";

// Utility function to clean data
const cleanData = (row: Record<string, any>) => {
  const cleanedRow: Record<string, any> = {};

  for (const key in row) {
    let value = row[key];

    if (typeof value === "string") {
      value = value.trim();
      if (value === "") value = null; // Convert empty strings to null
    }

    if (typeof value === "number" && isNaN(value)) {
      value = null; // Convert invalid numbers to null
    }

    cleanedRow[key] = value;
  }

  return cleanedRow;
};

export const processExcelFile = (
  file: File
): Promise<{ columns: ColumnData[]; rows: Record<string, any>[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target!.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });

      const sheetName = workbook.SheetNames[0]; // Read the first sheet
      const sheet = workbook.Sheets[sheetName];

      let jsonData: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, {
        raw: false, // Ensures that formatted values are used
      });

      if (jsonData.length === 0) {
        resolve({ columns: [], rows: [] }); // Return empty if no data
        return;
      }

      // 🔹 Apply `cleanData` to each row
      jsonData = jsonData.map(cleanData);

      // Extract column names (keys from the first row)
      const columnNames = Object.keys(jsonData[0]);

      // Transform columns into objects
      const columns: ColumnData[] = columnNames.map((col) => ({
        accessor: col,
        label: col
          .replace(/_/g, " ")
          .replace(/\b\w/g, (char) => char.toUpperCase()), // Format label
        type: "text", // Default type, can be modified dynamically
      }));

      // 🔹 `rows` should be an array of objects
      const rows = jsonData.map((row) => {
        const formattedRow: Record<string, any> = {};
        columns.forEach((col) => {
          formattedRow[col.accessor] = row[col.accessor] || "";
        });
        return formattedRow;
      });

      resolve({ columns, rows });
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};
