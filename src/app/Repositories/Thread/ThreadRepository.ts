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
import { ThreadResponseData } from "./data";
import { threadRules } from "./rules";
import { threadViews } from "./views";
import { threadColumns } from "./columns";
import { threadConfig } from "./config";

export default class ThreadRepository extends BaseRepository {
  public fillables: Array<keyof ThreadResponseData> = threadConfig.fillables;
  public rules: { [key: string]: string } = threadRules;
  public views: ViewsProps[] = threadViews;
  protected state: ThreadResponseData = threadConfig.state;
  public columns: ColumnData[] = threadColumns;
  public actions: ButtonsProp[] = threadConfig.actions;
  public fromJson(data: JsonResponse): ThreadResponseData {
    return {
      id: data.id ?? 0,
      pointer_identifier: data.pointer_identifier ?? "",
      identifier: data.identifier ?? "",
      thread_owner_id: data.thread_owner_id ?? 0,
      recipient_id: data.recipient_id ?? 0,
      category: data.category ?? "commented",
      conversations: data.conversations ?? [],
      priority: data.priority ?? "low",
      status: data.status ?? "pending",
      state: data.state ?? "open",
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
      document_id: data.document_id ?? 0,
    };
  }
  public associatedResources: DependencyProps[] =
    threadConfig.associatedResources;
}
