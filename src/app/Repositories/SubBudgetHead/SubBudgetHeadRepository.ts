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
import { SubBudgetHeadResponseData } from "./data";
import { subBudgetHeadRules } from "./rules";
import { subBudgetHeadViews } from "./views";
import { subBudgetHeadColumns } from "./columns";
import { subBudgetHeadConfig } from "./config";

export default class SubBudgetHeadRepository extends BaseRepository {
  public fillables: Array<keyof SubBudgetHeadResponseData> =
    subBudgetHeadConfig.fillables;
  public rules: { [key: string]: string } = subBudgetHeadRules;
  public views: ViewsProps[] = subBudgetHeadViews;
  protected state: SubBudgetHeadResponseData = subBudgetHeadConfig.state;
  public columns: ColumnData[] = subBudgetHeadColumns;
  public actions: ButtonsProp[] = subBudgetHeadConfig.actions;
  public fromJson(data: JsonResponse): SubBudgetHeadResponseData {
    return {
      id: data.id ?? 0,
      budget_head_id: data.budget_head_id ?? 0,
      name: data.name ?? "",
      type: data.type ?? "recurrent",
      is_blocked: data.is_blocked ?? 0,
      is_logistics: data.is_logistics ?? 0,
      has_fund: data.has_fund ?? false,
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
    };
  }
  public associatedResources: DependencyProps[] =
    subBudgetHeadConfig.associatedResources;
}
