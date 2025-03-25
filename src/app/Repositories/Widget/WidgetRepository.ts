import {
  ColumnData,
  ButtonsProp,
} from "resources/views/components/tables/CustomDataTable";
import { BaseRepository, DependencyProps, ViewsProps } from "../BaseRepository";
import { WidgetResponseData } from "./data";
import { widgetRules } from "./rules";
import { widgetViews } from "./views";
import { widgetColumns } from "./columns";
import { widgetConfig } from "./config";
import { formatOptions } from "app/Support/Helpers";

export default class WidgetRepository extends BaseRepository {
  public fillables: Array<keyof WidgetResponseData> = widgetConfig.fillables;
  public rules: { [key: string]: string } = widgetRules;
  public views: ViewsProps[] = widgetViews;
  protected state: WidgetResponseData = widgetConfig.state;
  public columns: ColumnData[] = widgetColumns;
  public actions: ButtonsProp[] = widgetConfig.actions;
  public fromJson(data: WidgetResponseData): WidgetResponseData {
    return {
      id: data.id ?? 0,
      document_type_id: data.document_type_id ?? 0,
      department_id: data.department_id ?? 0,
      title: data.title ?? "",
      component: data.component ?? "",
      chart_type: data.chart_type ?? "none",
      is_active: data.is_active ?? 0,
      response: data.response ?? "resource",
      type: data.type ?? "box",
      groups: formatOptions(data.groups, "id", "name") ?? [],
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
    };
  }
  public associatedResources: DependencyProps[] =
    widgetConfig.associatedResources;
}
