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
import { formatOptions } from "app/Support/Helpers";

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
      grade_level_id: data.grade_level_id ?? 0,
      department_id: data.department_id ?? 0,
      location_id: data.location_id ?? 0,
      default_page_id: data.default_page_id ?? 0,
      role_id: data.role_id ?? 0,
      staff_no: data.staff_no ?? "",
      firstname: data.firstname ?? "",
      middlename: data.middlename ?? "",
      surname: data.surname ?? "",
      avatar: data.avatar ?? "",
      gender: data.gender ?? "male",
      date_joined: data.date_joined ?? "",
      job_title: data.job_title ?? "",
      status: data.status ?? "available",
      role: data.role ?? null,
      is_admin: data.is_admin ?? 0,
      email: data.email ?? "",
      is_logged_in: data.is_logged_in ?? false,
      groups: formatOptions(data.groups, "id", "name") ?? [],
      blocked: data.blocked ?? 0,
      type: data.type ?? "permanent",
    };
  }
}
