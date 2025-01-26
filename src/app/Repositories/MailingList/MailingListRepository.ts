import {
  ColumnData,
  ButtonsProp,
} from "resources/views/components/tables/CustomDataTable";
import { BaseRepository, DependencyProps, ViewsProps } from "../BaseRepository";
import { MailingListResponseData } from "./data";
import { mailingListRules } from "./rules";
import { mailingListViews } from "./views";
import { mailingListColumns } from "./columns";
import { mailingListConfig } from "./config";

export default class MailingListRepository extends BaseRepository {
  public fillables: Array<keyof MailingListResponseData> =
    mailingListConfig.fillables;
  public rules: { [key: string]: string } = mailingListRules;
  public views: ViewsProps[] = mailingListViews;
  protected state: MailingListResponseData = mailingListConfig.state;
  public columns: ColumnData[] = mailingListColumns;
  public actions: ButtonsProp[] = mailingListConfig.actions;
  public fromJson(data: MailingListResponseData): MailingListResponseData {
    return {
      id: data.id ?? 0,
      group_id: data.group_id ?? 0,
      department_id: data.department_id ?? 0,
      name: data.name ?? "",
      group_name: data.group_name ?? "",
      department_name: data.department_name ?? "",
      group: data.group ?? null,
      department: data.department ?? null,
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
    };
  }
  public associatedResources: DependencyProps[] =
    mailingListConfig.associatedResources;
}
