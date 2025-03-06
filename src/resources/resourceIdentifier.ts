import { BudgetHeadResponseData } from "app/Repositories/BudgetHead/data";
import { DocumentActionResponseData } from "app/Repositories/DocumentAction/data";
import { FundResponseData } from "app/Repositories/Fund/data";
import { AuthPageResponseData } from "app/Repositories/Page/data";
import { SubBudgetHeadResponseData } from "app/Repositories/SubBudgetHead/data";
import { UserResponseData } from "app/Repositories/User/data";
import { ColumnData } from "./views/components/tables/CustomDataTable";

// Define a map of response data types
export const RESOURCE_MAPPINGS: Record<string, string[]> = {
  staff: [
    "staff_no",
    "firstname",
    "surname",
    "grade_level",
    "department",
    "role",
    "email",
    "gender",
    "type",
  ],
  sub_budget_heads: [],
  budget_heads: [],
  funds: [
    "sub_budget_head",
    "department",
    "budget_code",
    "total_approved_amount",
    "type",
    "budget_year",
  ],
  pages: [],
  document_actions: [],
};

/**
 * Identifies the best-matching resource type based on column names.
 */
export const identifyResourceType = (columns: ColumnData[]): string | null => {
  let bestMatch = null;
  let highestMatchCount = 0;

  for (const [resource, expectedColumns] of Object.entries(RESOURCE_MAPPINGS)) {
    const matchCount = expectedColumns.filter((col) =>
      columns.map((column) => column.accessor).includes(col)
    ).length;

    if (matchCount > highestMatchCount) {
      highestMatchCount = matchCount;
      bestMatch = resource;
    }
  }

  return bestMatch;
};
