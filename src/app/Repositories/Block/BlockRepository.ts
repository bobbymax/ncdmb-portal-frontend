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
import { BlockResponseData } from "./data";
import { blockRules } from "./rules";
import { blockViews } from "./views";
import { blockColumns } from "./columns";
import { blockConfig } from "./config";

export default class BlockRepository extends BaseRepository {
  public fillables: Array<keyof BlockResponseData> = blockConfig.fillables;
  public rules: { [key: string]: string } = blockRules;
  public views: ViewsProps[] = blockViews;
  protected state: BlockResponseData = blockConfig.state;
  public columns: ColumnData[] = blockColumns;
  public actions: ButtonsProp[] = blockConfig.actions;
  public fromJson(data: JsonResponse): BlockResponseData {
    return {
      id: data.id ?? 0,
      title: data.title ?? "",
      icon: data.icon ?? "",
      data_type: data.data_type ?? "paragraph",
      input_type: data.input_type ?? "ParagraphBlock",
      max_words: data.max_words ?? 0,
      type: data.type ?? "document",
      active: data.active ?? 0,
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
    };
  }
  public associatedResources: DependencyProps[] =
    blockConfig.associatedResources;
}
