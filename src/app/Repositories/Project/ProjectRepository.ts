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
import { ProjectResponseData } from "./data";
import { projectRules } from "./rules";
import { projectViews } from "./views";
import { projectColumns } from "./columns";
import { projectConfig } from "./config";

export default class ProjectRepository extends BaseRepository {
  public fillables: Array<keyof ProjectResponseData> = projectConfig.fillables;
  public rules: { [key: string]: string } = projectRules;
  public views: ViewsProps[] = projectViews;
  protected state: ProjectResponseData = projectConfig.state;
  public columns: ColumnData[] = projectColumns;
  public actions: ButtonsProp[] = projectConfig.actions;
  public fromJson(data: JsonResponse): ProjectResponseData {
    return {
      id: data.id ?? 0,
      user_id: data.user_id ?? 0,
      department_id: data.department_id ?? 0,
      threshold_id: data.threshold_id ?? 0,
      project_category_id: data.project_category_id ?? 0,
      code: data.code ?? "",
      title: data.title ?? "",
      description: data.description ?? "",
      service_charge_percentage: data.service_charge_percentage ?? 0,
      total_proposed_amount: data.total_proposed_amount ?? 0,
      total_approved_amount: data.total_approved_amount ?? 0,
      variation_amount: data.variation_amount ?? 0,
      sub_total_amount: data.sub_total_amount ?? 0,
      vat_amount: data.vat_amount ?? 0,
      markup_amount: data.markup_amount ?? 0,
      approved_start_date: data.approved_start_date ?? "",
      approved_end_date: data.approved_end_date ?? "",
      actual_end_date: data.actual_end_date ?? "",
      proposed_start_date: data.proposed_start_date ?? "",
      proposed_end_date: data.proposed_end_date ?? "",
      type: data.type ?? "third-party",
      status: data.status ?? "pending",
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
    };
  }
  public associatedResources: DependencyProps[] =
    projectConfig.associatedResources;
}
