import {
  ColumnData,
  ButtonsProp,
} from "resources/views/components/tables/CustomDataTable";
import { BaseRepository, DependencyProps, ViewsProps } from "../BaseRepository";
import { ClaimResponseData } from "./data";
import { claimRules } from "./rules";
import { claimViews } from "./views";
import { claimColumns } from "./columns";
import { claimConfig } from "./config";

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
        // Check if the value is a File (e.g., an image)
        if (value instanceof File) {
          result.append(key, value);
        } else if (
          Array.isArray(value) &&
          value.every((item) => item instanceof File)
        ) {
          // Handle multiple files if necessary
          value.forEach((file, index) => {
            result.append(`${key}[${index}]`, file);
          });
        } else {
          // Add non-file values
          result.append(key, value);
        }
      }
    });

    return result;
  };
  public fromJson(data: ClaimResponseData): ClaimResponseData {
    return {
      id: data.id ?? 0,
      user_id: data.user_id ?? 0,
      sponsoring_department_id: data.sponsoring_department_id,
      department_id: data.department_id ?? 0,
      document_type_id: data.document_type_id ?? 0,
      document_category_id: data.document_category_id,
      code: data.code ?? "",
      title: data.title ?? "",
      total_amount_spent: data.total_amount_spent ?? 0,
      total_amount_approved: data.total_amount_approved ?? 0,
      total_amount_retired: data.total_amount_retired ?? 0,
      type: data.type ?? "claim",
      status: data.status ?? "pending",
      retired: data.retired ?? false,
      trips: data.trips ?? [],
      supporting_documents: data.supporting_documents ?? [],
      expenses: data.expenses ?? [],
      start_date: data.start_date ?? "",
      end_date: data.end_date ?? "",
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
    };
  }
  public associatedResources: DependencyProps[] =
    claimConfig.associatedResources;
}
