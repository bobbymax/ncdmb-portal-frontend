import {
  ButtonsProp,
  ColumnData,
} from "resources/views/components/tables/CustomDataTable";
import { BaseRepository, DependencyProps, ViewsProps } from "../BaseRepository";
import { userViews } from "./views";
import { userConfig } from "./config";
import { userColumns } from "./columns";
import { userRules } from "./rules";
import { UserResponseData } from "./data";

export default class UserRepository extends BaseRepository {
  public fillables: Array<keyof UserResponseData> = userConfig.fillables;
  public associatedResources: DependencyProps[] =
    userConfig.associatedResources;
  public views: ViewsProps[] = userViews;
  protected state: UserResponseData = userConfig.state;
  public columns: ColumnData[] = userColumns;
  public actions: ButtonsProp[] = userConfig.actions;
  public rules: { [key: string]: string } = userRules;

  public fromJson(data: UserResponseData): UserResponseData {
    return {
      id: data.id ?? 0,
      name: data.name ?? "",
      email: data.email ?? "",
      staff_no: data.staff_no ?? "",
      is_logged_in: data.is_logged_in ?? false,
      roles: data.roles ?? [],
      default_page_id: 0,
      pages: data.pages ?? [],
    };
  }
}
