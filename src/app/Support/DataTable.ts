import { ColumnData } from "@views/components/tables/CustomDataTable";

interface Filters {
  [key: string]: any;
}

export type Raw = {
  [key: string]: any;
};

export type ConditionalArray = [
  keyof Raw,
  "!=" | "=" | ">" | "<" | "<=" | ">=",
  string | number
];

export default class DataTable {
  data: Record<string, any>[];
  columns: ColumnData[];
  pageSize: number;

  constructor(
    data: Record<string, any>[],
    columns: ColumnData[],
    pageSize: number
  ) {
    this.data = data;
    this.columns = columns;
    this.pageSize = pageSize;
  }

  paginate = (page: number, filters: object, searchTerm: string | null) => {
    let filteredData = this.applyFilters(this.data, filters);
    let searchData = this.applySearch(filteredData, searchTerm);
    return this.getPaginatedData(searchData, page);
  };

  applyFilters = (data: Record<string, any>[], filters: Filters) => {
    let filteredData = data;
    Object.keys(filters).forEach((key: string) => {
      if (filters[key]) {
        filteredData = filteredData.filter((item) =>
          item[key]
            ?.toString()
            ?.toLowerCase()
            ?.includes(filters[key].toLowerCase())
        );
      }
    });
    return filteredData;
  };

  applySearch = (data: Record<string, any>[], searchTerm: string | null) => {
    if (!searchTerm) return data;
    const lowerCaseSearch = searchTerm.toLowerCase();
    return data.filter((item) =>
      Object.values(item).some((val) =>
        val?.toString()?.toLowerCase()?.includes(lowerCaseSearch)
      )
    );
  };

  getPaginatedData = (data: Record<string, any>[], page: number) => {
    const startIndex = (page - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return data.slice(startIndex, endIndex);
  };

  //   Export Data Method Here
}
