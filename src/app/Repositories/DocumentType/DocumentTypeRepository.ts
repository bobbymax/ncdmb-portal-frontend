import {
  ColumnData,
  ButtonsProp,
} from "resources/views/components/tables/CustomDataTable";
import { BaseRepository, DependencyProps, ViewsProps } from "../BaseRepository";
import { DocumentTypeResponseData } from "./data";
import { documentTypeRules } from "./rules";
import { documentTypeViews } from "./views";
import { documentTypeColumns } from "./columns";
import { documentTypeConfig } from "./config";

export default class DocumentTypeRepository extends BaseRepository {
  public fillables: Array<keyof DocumentTypeResponseData> =
    documentTypeConfig.fillables;
  public rules: { [key: string]: string } = documentTypeRules;
  public views: ViewsProps[] = documentTypeViews;
  protected state: DocumentTypeResponseData = documentTypeConfig.state;
  public columns: ColumnData[] = documentTypeColumns;
  public actions: ButtonsProp[] = documentTypeConfig.actions;
  public fromJson(data: DocumentTypeResponseData): DocumentTypeResponseData {
    return {
      id: data.id ?? 0,
      name: data.name ?? "",
      label: data.label ?? "",
      workflow: data.workflow ?? null,
      categories: data.categories ?? [],
      description: data.description ?? "",
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
    };
  }
  public associatedResources: DependencyProps[] =
    documentTypeConfig.associatedResources;
}