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
import { AuthPageResponseData } from "./data";
import { pageConfig } from "./config";
import { pageRules } from "./rules";
import { pageColumns } from "./columns";
import { pageViews } from "./views";
import { formatOptions } from "app/Support/Helpers";

export default class PageRepository extends BaseRepository {
  public fillables: Array<keyof AuthPageResponseData> = pageConfig.fillables;
  public rules: { [key: string]: string } = pageRules;
  public views: ViewsProps[] = pageViews;
  protected state: AuthPageResponseData = pageConfig.state;
  public columns: ColumnData[] = pageColumns;
  public actions: ButtonsProp[] = pageConfig.actions;
  public fromJson(data: JsonResponse): AuthPageResponseData {
    return {
      id: data.id || 0,
      name: data.name || "",
      icon: data.icon || "",
      is_default: data.is_default ?? false,
      is_menu: data.is_menu ?? false,
      path: data.path ?? "",
      parent_id: data.parent_id ?? 0,
      workflow_id: data.workflow_id ?? 0,
      document_type_id: data.document_type_id ?? 0,
      roles: formatOptions(data.roles ?? [], "id", "name") ?? [],
      workflow: data.workflow ?? null,
      documentType: data.documentType ?? null,
      signatories: data.signatories ?? [],
      type: "index",
      label: "",
    };
  }
  public associatedResources: DependencyProps[] =
    pageConfig.associatedResources;
}
