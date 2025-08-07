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
import { TemplateResponseData } from "./data";
import { templateRules } from "./rules";
import { templateViews } from "./views";
import { templateColumns } from "./columns";
import { templateConfig } from "./config";
import { ConfigState } from "app/Hooks/useTemplateHeader";

export default class TemplateRepository extends BaseRepository {
  public fillables: Array<keyof TemplateResponseData> =
    templateConfig.fillables;
  public rules: { [key: string]: string } = templateRules;
  public views: ViewsProps[] = templateViews;
  protected state: TemplateResponseData = templateConfig.state;
  public columns: ColumnData[] = templateColumns;
  public actions: ButtonsProp[] = templateConfig.actions;
  public fromJson(data: JsonResponse): TemplateResponseData {
    return {
      id: data.id ?? 0,
      document_category_id: data.document_category_id ?? 0,
      name: data.name ?? "",
      header: data.header ?? "",
      config: data.config ?? {
        subject: "",
        process: {} as ConfigState,
      },
      body: data.body ?? [],
      footer: data.footer ?? "",
      active: data.active ?? 0,
      blocks: data.blocks ?? [],
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
    };
  }
  public associatedResources: DependencyProps[] =
    templateConfig.associatedResources;
}
