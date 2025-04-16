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
import { EntityResponseData } from "./data";
import { entityRules } from "./rules";
import { entityViews } from "./views";
import { entityColumns } from "./columns";
import { entityConfig } from "./config";

export default class EntityRepository extends BaseRepository {
  public fillables: Array<keyof EntityResponseData> = entityConfig.fillables;
  public rules: { [key: string]: string } = entityRules;
  public views: ViewsProps[] = entityViews;
  protected state: EntityResponseData = entityConfig.state;
  public columns: ColumnData[] = entityColumns;
  public actions: ButtonsProp[] = entityConfig.actions;
  public fromJson(data: JsonResponse): EntityResponseData {
    return {
      id: data.id ?? 0,
      name: data.name ?? "",
      acronym: data.acronym ?? "",
      status: data.status ?? "active",
      payment_code: data.payment_code ?? "",
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
    };
  }
  public associatedResources: DependencyProps[] =
    entityConfig.associatedResources;
}
