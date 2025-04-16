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
import { LedgerResponseData } from "./data";
import { ledgerRules } from "./rules";
import { ledgerViews } from "./views";
import { ledgerColumns } from "./columns";
import { ledgerConfig } from "./config";

export default class LedgerRepository extends BaseRepository {
  public fillables: Array<keyof LedgerResponseData> = ledgerConfig.fillables;
  public rules: { [key: string]: string } = ledgerRules;
  public views: ViewsProps[] = ledgerViews;
  protected state: LedgerResponseData = ledgerConfig.state;
  public columns: ColumnData[] = ledgerColumns;
  public actions: ButtonsProp[] = ledgerConfig.actions;
  public fromJson(data: JsonResponse): LedgerResponseData {
    return {
      id: data.id ?? 0,
      code: data.code ?? "B",
      name: data.name ?? "",
      description: data.description ?? "",
      groups: data.groups ?? [],
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
    };
  }
  public associatedResources: DependencyProps[] =
    ledgerConfig.associatedResources;
}
