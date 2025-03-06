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
import { FundResponseData } from "./data";
import { fundRules } from "./rules";
import { fundViews } from "./views";
import { fundColumns } from "./columns";
import { fundConfig } from "./config";

export default class FundRepository extends BaseRepository {
  public fillables: Array<keyof FundResponseData> = fundConfig.fillables;
  public rules: { [key: string]: string } = fundRules;
  public views: ViewsProps[] = fundViews;
  protected state: FundResponseData = fundConfig.state;
  public columns: ColumnData[] = fundColumns;
  public actions: ButtonsProp[] = fundConfig.actions;
  public fromJson(data: JsonResponse): FundResponseData {
    return {
      id: data.id ?? 0,
      sub_budget_head_id: data.sub_budget_head_id ?? 0,
      department_id: data.department_id ?? 0,
      budget_code_id: data.budget_code_id ?? 0,
      total_approved_amount: data.total_approved_amount ?? 0,
      budget_year: data.budget_year ?? 0,
      is_exhausted: data.is_exhausted ?? 0,
      is_logistics: data.is_logistics ?? 0,
      type: data.type ?? "capital",
      budget_code: data.budget_code ?? "",
      sub_budget_head: data.sub_budget_head ?? "",
      owner: data.owner ?? "",
      name: data.name ?? "",
      approved_amount: data.approved_amount ?? "",
      exhausted: data.exhausted ?? "",
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
    };
  }
  public associatedResources: DependencyProps[] =
    fundConfig.associatedResources;
}
