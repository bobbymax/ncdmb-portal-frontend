import * as XLSX from "xlsx";

export interface Header {
  accessor: string;
  label: string;
}

export interface ParsedData {
  headers: Header[];
  data: Record<string, any>[];
}

export default class Upload {
  public static excel(file: File): Promise<ParsedData | null> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const binaryStr = event.target?.result;

        if (
          typeof binaryStr !== "string" &&
          !(binaryStr instanceof ArrayBuffer)
        ) {
          reject(new Error("Invalid file content"));
          return;
        }

        try {
          const workbook = XLSX.read(binaryStr, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];

          const fileData: any[][] = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
          });
          const headers = fileData[0] as string[];

          const parsedHeaders: Header[] = headers.map((header) => ({
            accessor: header,
            label: header,
          }));

          // Remove the headers row from the data
          fileData.splice(0, 1);

          const jsonData = Upload.toJson(
            parsedHeaders.map((h) => h.accessor),
            fileData
          );

          resolve({ headers: parsedHeaders, data: jsonData });
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error("File reading error"));

      if (file) {
        reader.readAsArrayBuffer(file);
      } else {
        reject(new Error("No file provided"));
      }
    });
  }

  public static export(data: Record<string, any>[], file: string) {
    const worksheet = XLSX.utils.json_to_sheet(data);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    XLSX.writeFile(workbook, `${file}.xlsx`);
  }

  protected static toJson(
    headers: string[],
    data: any[][]
  ): Record<string, any>[] {
    return data.map((row) => {
      const rowData: Record<string, string | number> = {};

      row.forEach((value, index) => {
        rowData[headers[index]] = String(value);
      });

      return rowData;
    });
  }
}
