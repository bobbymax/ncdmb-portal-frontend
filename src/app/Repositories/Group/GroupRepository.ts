import {
  ColumnData,
  ButtonsProp,
} from "resources/views/components/tables/CustomDataTable";
import { BaseRepository, DependencyProps, ViewsProps } from "../BaseRepository";
import { GroupResponseData } from "./data";
import { groupRules } from "./rules";
import { groupViews } from "./views";
import { groupColumns } from "./columns";
import { groupConfig } from "./config";

export default class GroupRepository extends BaseRepository {
  public fillables: Array<keyof GroupResponseData> = groupConfig.fillables;
  public rules: { [key: string]: string } = groupRules;
  public views: ViewsProps[] = groupViews;
  protected state: GroupResponseData = groupConfig.state;
  public columns: ColumnData[] = groupColumns;
  public actions: ButtonsProp[] = groupConfig.actions;
  public fromJson(data: GroupResponseData): GroupResponseData {
    return {
      id: data.id ?? 0,
      name: data.name ?? "",
      label: data.label ?? "",
      carderIds: data.carderIds ?? [],
      users: data.users ?? [],
      rank: data.rank ?? 0,
      scope: data.scope ?? "department",
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
    };
  }
  public associatedResources: DependencyProps[] =
    groupConfig.associatedResources;
}
