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
import { ProjectCategoryResponseData } from "./data";
import { projectCategoryRules } from "./rules";
import { projectCategoryViews } from "./views";
import { projectCategoryColumns } from "./columns";
import { projectCategoryConfig } from "./config";

export default class ProjectCategoryRepository extends BaseRepository {
  public fillables: Array<keyof ProjectCategoryResponseData> =
    projectCategoryConfig.fillables;
  public rules: { [key: string]: string } = projectCategoryRules;
  public views: ViewsProps[] = projectCategoryViews;
  protected state: ProjectCategoryResponseData = projectCategoryConfig.state;
  public columns: ColumnData[] = projectCategoryColumns;
  public actions: ButtonsProp[] = projectCategoryConfig.actions;
  public fromJson(data: JsonResponse): ProjectCategoryResponseData {
    return {
      id: data.id ?? 0,
      name: data.name ?? "",
      label: data.label ?? "",
      description: data.description ?? "",
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
    };
  }
  public associatedResources: DependencyProps[] =
    projectCategoryConfig.associatedResources;
}
