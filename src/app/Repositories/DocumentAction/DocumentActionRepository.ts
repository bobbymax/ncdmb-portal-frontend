import {
  ColumnData,
  ButtonsProp,
} from "resources/views/components/tables/CustomDataTable";
import { BaseRepository, DependencyProps, ViewsProps } from "../BaseRepository";
import { DocumentActionResponseData } from "./data";
import { documentActionRules } from "./rules";
import { documentActionViews } from "./views";
import { documentActionColumns } from "./columns";
import { documentActionConfig } from "./config";

export default class DocumentActionRepository extends BaseRepository {
  public fillables: Array<keyof DocumentActionResponseData> =
    documentActionConfig.fillables;
  public rules: { [key: string]: string } = documentActionRules;
  public views: ViewsProps[] = documentActionViews;
  protected state: DocumentActionResponseData = documentActionConfig.state;
  public columns: ColumnData[] = documentActionColumns;
  public actions: ButtonsProp[] = documentActionConfig.actions;
  public fromJson(
    data: DocumentActionResponseData
  ): DocumentActionResponseData {
    return {
      id: data.id ?? 0,
      name: data.name ?? "",
      description: data.description ?? "",
      button_text: data.button_text ?? "",
      url: data.url ?? "",
      frontend_path: data.frontend_path ?? "",
      icon: data.icon ?? "",
      variant: data.variant ?? "",
      status: data.status ?? "",
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
    };
  }
  public associatedResources: DependencyProps[] =
    documentActionConfig.associatedResources;
}
