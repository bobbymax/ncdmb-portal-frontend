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
  public fromJson(data: JsonResponse): DocumentTypeResponseData {
    return {
      id: data.id ?? 0,
      name: data.name ?? "",
      label: data.label ?? "",
      file_template_id: data.file_template_id ?? 0,
      template: data.template ?? null,
      workflow: data.workflow ?? null,
      service: data.service ?? "",
      categories: data.categories ?? [],
      widgets: data.widgets ?? [],
      description: data.description ?? "",
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
    };
  }
  public associatedResources: DependencyProps[] =
    documentTypeConfig.associatedResources;
}
