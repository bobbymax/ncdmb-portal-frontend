import {
  ColumnData,
  ButtonsProp,
} from "resources/views/components/tables/CustomDataTable";
import { BaseRepository, DependencyProps, ViewsProps } from "../BaseRepository";
import { roleConfig } from "./config";
import { roleRules } from "./rules";
import { roleViews } from "./views";
import { roleColumns } from "./columns";
import { RoleResponseData } from "./data";

export default class RoleRepository extends BaseRepository {
  public fillables: Array<keyof RoleResponseData> = roleConfig.fillables;
  public rules: { [key: string]: string } = roleRules;
  public views: ViewsProps[] = roleViews;
  protected state: RoleResponseData = roleConfig.state;
  public columns: ColumnData[] = roleColumns;
  public actions: ButtonsProp[] = roleConfig.actions;
  public fromJson(data: RoleResponseData): RoleResponseData {
    return {
      id: data.id ?? 0,
      name: data.name ?? "",
      department_id: data.department_id ?? 0,
      slots: data.slots ?? 0,
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
    };
  }
  public associatedResources: DependencyProps[] =
    roleConfig.associatedResources;
}
