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
  public fromJson(data: JsonResponse): DocumentActionResponseData {
    return {
      id: data.id ?? 0,
      carder_id: data.carder_id ?? 0,
      trigger_workflow_id: data.trigger_workflow_id,
      name: data.name ?? "",
      label: data.label ?? "",
      description: data.description ?? "",
      button_text: data.button_text ?? "",
      draft_status: data.draft_status ?? "",
      action_status: data.action_status ?? "passed",
      icon: data.icon ?? "",
      variant: data.variant ?? "",
      state: data.state ?? "conditional",
      mode: data.mode ?? "store",
      category: data.category ?? "comment",
      resource_type: data.resource_type ?? "searchable",
      component: data.component ?? "",
      has_update: data.has_update ?? 0,
      is_resource: data.is_resource ?? 0,
      is_payment: data.is_payment ?? 0,
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
    };
  }
  public associatedResources: DependencyProps[] =
    documentActionConfig.associatedResources;
}
