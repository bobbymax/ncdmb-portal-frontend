import {
  ColumnData,
  ButtonsProp,
} from "resources/views/components/tables/CustomDataTable";
import { BaseRepository, DependencyProps, ViewsProps } from "../BaseRepository";
import { DocumentPanelResponseData } from "./data";
import { documentPanelRules } from "./rules";
import { documentPanelViews } from "./views";
import { documentPanelColumns } from "./columns";
import { documentPanelConfig } from "./config";

export default class DocumentPanelRepository extends BaseRepository {
  public fillables: Array<keyof DocumentPanelResponseData> =
    documentPanelConfig.fillables;
  public rules: { [key: string]: string } = documentPanelRules;
  public views: ViewsProps[] = documentPanelViews;
  protected state: DocumentPanelResponseData = documentPanelConfig.state;
  public columns: ColumnData[] = documentPanelColumns;
  public actions: ButtonsProp[] = documentPanelConfig.actions;
  public fromJson(data: DocumentPanelResponseData): DocumentPanelResponseData {
    return {
      id: data.id ?? 0,
      document_category_id: data.document_category_id ?? 0,
      name: data.name ?? "",
      label: data.label ?? "",
      icon: data.icon ?? "",
      component_path: data.component_path ?? "",
      order: data.order ?? 0,
      is_active: data.is_active ?? false,
      is_editor_only: data.is_editor_only ?? false,
      is_view_only: data.is_view_only ?? false,
      visibility_mode: data.visibility_mode ?? "both",
      is_global: data.is_global ?? false,
      document_category: data.document_category ?? null,
      document_status: data.document_status ?? "",
      groups: data.groups ?? [],
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
    };
  }
  public associatedResources: DependencyProps[] =
    documentPanelConfig.associatedResources;
}
