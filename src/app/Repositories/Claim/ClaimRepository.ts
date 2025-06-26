import {
  ColumnData,
  ButtonsProp,
} from "resources/views/components/tables/CustomDataTable";
import {
  BaseRepository,
  DependencyProps,
  JsonResponse,
  ViewsProps,
} from "../BaseRepository";
import { ClaimResponseData } from "./data";
import { claimRules } from "./rules";
import { claimViews } from "./views";
import { claimColumns } from "./columns";
import { claimConfig } from "./config";
import { ExpenseResponseData } from "../Expense/data";
import { AllowanceResponseData } from "../Allowance/data";

export interface AddExpenseForAllowance {
  expenses: ExpenseResponseData[];
  allowance: AllowanceResponseData;
  startDate?: string;
  description: string;
  numOfDays?: number;
  endDate?: string;
  type: "flight-takeoff" | "flight-land" | "road" | "per-diem" | "wallet";
  distance_covered?: number;
  useDistance?: boolean;
}

export default class ClaimRepository extends BaseRepository {
  public fillables: Array<keyof ClaimResponseData> = claimConfig.fillables;
  public rules: { [key: string]: string } = claimRules;
  public views: ViewsProps[] = claimViews;
  protected state: ClaimResponseData = claimConfig.state;
  public columns: ColumnData[] = claimColumns;
  public actions: ButtonsProp[] = claimConfig.actions;
  public formatDataOnSubmit = (data: Record<string, any>): FormData => {
    const result = new FormData();

    this.fillables.forEach((key) => {
      if (key in data) {
        const value = data[key];

        if (value instanceof File) {
          // Single file
          result.append(key, value);
        } else if (Array.isArray(value)) {
          if (value.every((item) => item instanceof File)) {
            // Array of files
            value.forEach((file) => result.append(`${key}[]`, file));
          } else {
            // Non-file array
            result.append(key, JSON.stringify(value));
          }
        } else {
          // Append an empty string for null or undefined values (optional)
          result.append(key, value?.toString());
        }
      }
    });

    return result;
  };
  public fromJson(data: JsonResponse): ClaimResponseData {
    return {
      id: data.id ?? 0,
      user_id: data.user_id ?? 0,
      document_id: data.document_id ?? 0,
      sponsoring_department_id: data.sponsoring_department_id,
      department_id: data.department_id ?? 0,
      document_type_id: data.document_type_id ?? 0,
      authorising_staff_id: data.authorising_staff_id ?? 0,
      document_category_id: data.document_category_id ?? 0,
      code: data.code ?? "",
      title: data.title ?? "",
      category_label: data.category_label ?? "",
      total_amount_spent: data.total_amount_spent ?? 0,
      total_amount_approved: data.total_amount_approved ?? 0,
      total_amount_retired: data.total_amount_retired ?? 0,
      type: data.type ?? "claim",
      status: data.status ?? "pending",
      retired: data.retired ?? false,
      owner: data.owner ?? null,
      trips: data.trips ?? [],
      supporting_documents: data.supporting_documents ?? [],
      department_name: data.department_name ?? "",
      beneficiary: data.beneficiary ?? null,
      expenses: data.expenses ?? [],
      uploads: data.uploads ?? [],
      start_date: data.start_date ?? "",
      end_date: data.end_date ?? "",
      deletedExpenses: data.deletedExpenses ?? [],
      deletedUploads: data.deletedUploads ?? [],
      claimant_signature: data.claimant_signature ?? "",
      approval_signature: data.approval_signature ?? "",
      authorising_officer: data.authorising_officer ?? null,
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
    };
  }
  public associatedResources: DependencyProps[] =
    claimConfig.associatedResources;
}
