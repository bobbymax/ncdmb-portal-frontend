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
import { ChartOfAccountResponseData } from "./data";
import { chartOfAccountRules } from "./rules";
import { chartOfAccountViews } from "./views";
import { chartOfAccountColumns } from "./columns";
import { chartOfAccountConfig } from "./config";

export default class ChartOfAccountRepository extends BaseRepository {
  public fillables: Array<keyof ChartOfAccountResponseData> =
    chartOfAccountConfig.fillables;
  public rules: { [key: string]: string } = chartOfAccountRules;
  public views: ViewsProps[] = chartOfAccountViews;
  protected state: ChartOfAccountResponseData = chartOfAccountConfig.state;
  public columns: ColumnData[] = chartOfAccountColumns;
  public actions: ButtonsProp[] = chartOfAccountConfig.actions;
  public fromJson(data: JsonResponse): ChartOfAccountResponseData {
    return {
      id: data.id ?? 0,
      account_code: data.account_code ?? "",
      name: data.name ?? "",
      type: data.type ?? "expense",
      parent_id: data.parent_id ?? 0,
      level: data.level ?? "ledger",
      status: data.status ?? "O",
      is_postable: data.is_postable ?? 0,
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
    };
  }
  public associatedResources: DependencyProps[] =
    chartOfAccountConfig.associatedResources;
}
