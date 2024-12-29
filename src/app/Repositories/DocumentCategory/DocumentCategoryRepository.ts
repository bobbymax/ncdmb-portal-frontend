import {
  ColumnData,
  ButtonsProp,
} from "resources/views/components/tables/CustomDataTable";
import { BaseRepository, DependencyProps, ViewsProps } from "../BaseRepository";
import { DocumentCategoryResponseData } from "./data";
import { documentCategoryRules } from "./rules";
import { documentCategoryViews } from "./views";
import { documentCategoryColumns } from "./columns";
import { documentCategoryConfig } from "./config";

export default class DocumentCategoryRepository extends BaseRepository {
  public fillables: Array<keyof DocumentCategoryResponseData> =
    documentCategoryConfig.fillables;
  public rules: { [key: string]: string } = documentCategoryRules;
  public views: ViewsProps[] = documentCategoryViews;
  protected state: DocumentCategoryResponseData = documentCategoryConfig.state;
  public columns: ColumnData[] = documentCategoryColumns;
  public actions: ButtonsProp[] = documentCategoryConfig.actions;
  public fromJson(
    data: DocumentCategoryResponseData
  ): DocumentCategoryResponseData {
    return {
      id: data.id ?? 0,
      document_type_id: data.document_type_id ?? 0,
      name: data.name ?? "",
      label: data.label ?? "",
      icon: data.icon ?? "",
      description: data.description ?? "",
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
    };
  }
  public associatedResources: DependencyProps[] =
    documentCategoryConfig.associatedResources;
}