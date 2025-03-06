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
import { BudgetHeadResponseData } from "./data";
import { budgetHeadRules } from "./rules";
import { budgetHeadViews } from "./views";
import { budgetHeadColumns } from "./columns";
import { budgetHeadConfig } from "./config";

export default class BudgetHeadRepository extends BaseRepository {
  public fillables: Array<keyof BudgetHeadResponseData> =
    budgetHeadConfig.fillables;
  public rules: { [key: string]: string } = budgetHeadRules;
  public views: ViewsProps[] = budgetHeadViews;
  protected state: BudgetHeadResponseData = budgetHeadConfig.state;
  public columns: ColumnData[] = budgetHeadColumns;
  public actions: ButtonsProp[] = budgetHeadConfig.actions;
  public fromJson(data: JsonResponse): BudgetHeadResponseData {
    return {
      id: data.id ?? 0,
      code: data.code ?? "",
      name: data.name ?? "",
      label: data.label ?? "",
      is_blocked: data.is_blocked ?? 0,
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
    };
  }
  public associatedResources: DependencyProps[] =
    budgetHeadConfig.associatedResources;
}
