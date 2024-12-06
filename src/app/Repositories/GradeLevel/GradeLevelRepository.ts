import {
  ColumnData,
  ButtonsProp,
} from "resources/views/components/tables/CustomDataTable";
import { BaseRepository, DependencyProps, ViewsProps } from "../BaseRepository";
import { GradeLevelResponseData } from "./data";
import { gradeLevelRules } from "./rules";
import { gradeLevelViews } from "./views";
import { gradeLevelColumns } from "./columns";
import { gradeLevelConfig } from "./config";

export default class GradeLevelRepository extends BaseRepository {
  public fillables: Array<keyof GradeLevelResponseData> =
    gradeLevelConfig.fillables;
  public rules: { [key: string]: string } = gradeLevelRules;
  public views: ViewsProps[] = gradeLevelViews;
  protected state: GradeLevelResponseData = gradeLevelConfig.state;
  public columns: ColumnData[] = gradeLevelColumns;
  public actions: ButtonsProp[] = gradeLevelConfig.actions;
  public fromJson(data: GradeLevelResponseData): GradeLevelResponseData {
    return {
      id: data.id ?? 0,
      name: data.name ?? "",
      key: data.key ?? "",
      type: data.type ?? "board",
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
    };
  }
  public associatedResources: DependencyProps[] =
    gradeLevelConfig.associatedResources;
}
