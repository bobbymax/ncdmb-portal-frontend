import {
  ColumnData,
  ButtonsProp,
} from "resources/views/components/tables/CustomDataTable";
import { BaseRepository, DependencyProps, ViewsProps } from "../BaseRepository";
import { BudgetCodeResponseData } from "./data";
import { budgetCodeRules } from "./rules";
import { budgetCodeViews } from "./views";
import { budgetCodeColumns } from "./columns";
import { budgetCodeConfig } from "./config";

export default class BudgetCodeRepository extends BaseRepository {
  public fillables: Array<keyof BudgetCodeResponseData> =
    budgetCodeConfig.fillables;
  public rules: { [key: string]: string } = budgetCodeRules;
  public views: ViewsProps[] = budgetCodeViews;
  protected state: BudgetCodeResponseData = budgetCodeConfig.state;
  public columns: ColumnData[] = budgetCodeColumns;
  public actions: ButtonsProp[] = budgetCodeConfig.actions;
  public fromJson(data: BudgetCodeResponseData): BudgetCodeResponseData {
    return {
      id: data.id ?? 0,
      code: data.code ?? "",
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
    };
  }
  public associatedResources: DependencyProps[] =
    budgetCodeConfig.associatedResources;
}
