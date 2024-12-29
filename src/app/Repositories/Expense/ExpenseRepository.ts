import {
  ColumnData,
  ButtonsProp,
} from "resources/views/components/tables/CustomDataTable";
import { BaseRepository, DependencyProps, ViewsProps } from "../BaseRepository";
import { ExpenseResponseData } from "./data";
import { expenseRules } from "./rules";
import { expenseViews } from "./views";
import { expenseColumns } from "./columns";
import { expenseConfig } from "./config";

export default class ExpenseRepository extends BaseRepository {
  public fillables: Array<keyof ExpenseResponseData> = expenseConfig.fillables;
  public rules: { [key: string]: string } = expenseRules;
  public views: ViewsProps[] = expenseViews;
  protected state: ExpenseResponseData = expenseConfig.state;
  public columns: ColumnData[] = expenseColumns;
  public actions: ButtonsProp[] = expenseConfig.actions;
  public fromJson(data: ExpenseResponseData): ExpenseResponseData {
    return {
      id: data.id ?? 0,
      identifier: data.identifier ?? "",
      parent_id: data.parent_id ?? 0,
      allowance_id: data.allowance_id ?? 0,
      remuneration_id: data.remuneration_id ?? 0,
      start_date: data.start_date ?? "",
      end_date: data.end_date ?? "",
      no_of_days: data.no_of_days ?? 0,
      total_distance_covered: data.total_distance_covered ?? 0,
      unit_price: data.unit_price ?? 0,
      total_amount_spent: data.total_amount_spent ?? 0,
      description: data.description ?? "",
      type: data.type ?? "flight-takeoff",
      status: data.status ?? "pending",
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
    };
  }
  public associatedResources: DependencyProps[] =
    expenseConfig.associatedResources;
}
