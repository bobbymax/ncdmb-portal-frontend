import {
  ColumnData,
  ButtonsProp,
} from "resources/views/components/tables/CustomDataTable";
import { BaseRepository, DependencyProps, ViewsProps } from "../BaseRepository";
import { StageCategoryResponseData } from "./data";
import { stageCategoryRules } from "./rules";
import { stageCategoryViews } from "./views";
import { stageCategoryColumns } from "./columns";
import { stageCategoryConfig } from "./config";

export default class StageCategoryRepository extends BaseRepository {
  public fillables: Array<keyof StageCategoryResponseData> =
    stageCategoryConfig.fillables;
  public rules: { [key: string]: string } = stageCategoryRules;
  public views: ViewsProps[] = stageCategoryViews;
  protected state: StageCategoryResponseData = stageCategoryConfig.state;
  public columns: ColumnData[] = stageCategoryColumns;
  public actions: ButtonsProp[] = stageCategoryConfig.actions;
  public formatDataOnSubmit = (data: Record<string, any>): FormData => {
    const result = new FormData();

    this.fillables.forEach((key) => {
      if (key in data) {
        const value = data[key];

        if (value instanceof File) {
          // Single file
          result.append(key, value);
        } else if (Array.isArray(value)) {
          if (value.every((item) => item instanceof File)) {
            // Array of files
            value.forEach((file) => result.append(`${key}[]`, file));
          } else {
            // Non-file array
            result.append(key, JSON.stringify(value));
          }
        } else {
          // Append an empty string for null or undefined values (optional)
          result.append(key, value?.toString());
        }
      }
    });

    return result;
  };
  public fromJson(data: StageCategoryResponseData): StageCategoryResponseData {
    return {
      id: data.id ?? 0,
      name: data.name ?? "",
      label: data.label ?? "",
      description: data.description ?? "",
      icon_path: data.icon_path ?? "",
      icon_path_blob: data.icon_path_blob ?? null,
      upload: data.upload ?? null,
      actions: data.actions ?? [],
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
    };
  }
  public associatedResources: DependencyProps[] =
    stageCategoryConfig.associatedResources;
}
