import {
  ColumnData,
  ButtonsProp,
} from "resources/views/components/tables/CustomDataTable";
import { BaseRepository, DependencyProps, ViewsProps } from "../BaseRepository";
import { QueryResponseData } from "./data";
import { queryRules } from "./rules";
import { queryViews } from "./views";
import { queryColumns } from "./columns";
import { queryConfig } from "./config";

export default class QueryRepository extends BaseRepository {
  public fillables: Array<keyof QueryResponseData> = queryConfig.fillables;
  public rules: { [key: string]: string } = queryRules;
  public views: ViewsProps[] = queryViews;
  protected state: QueryResponseData = queryConfig.state;
  public columns: ColumnData[] = queryColumns;
  public actions: ButtonsProp[] = queryConfig.actions;
  public fromJson(data: QueryResponseData): QueryResponseData {
    return {
      id: data.id ?? 0,
      user_id: data.user_id ?? 0,
      group_id: data.group_id ?? 0,
      document_id: data.document_id ?? 0,
      document_draft_id: data.document_draft_id ?? 0,
      message: data.message ?? "",
      response: data.response ?? null,
      priority: data.priority ?? "low",
      status: data.status ?? "open",
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
    };
  }
  public associatedResources: DependencyProps[] =
    queryConfig.associatedResources;
}
