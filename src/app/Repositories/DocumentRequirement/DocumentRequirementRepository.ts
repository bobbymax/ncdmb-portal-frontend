import {
  ColumnData,
  ButtonsProp,
} from "resources/views/components/tables/CustomDataTable";
import { BaseRepository, DependencyProps, ViewsProps } from "../BaseRepository";
import { DocumentRequirementResponseData } from "./data";
import { documentRequirementRules } from "./rules";
import { documentRequirementViews } from "./views";
import { documentRequirementColumns } from "./columns";
import { documentRequirementConfig } from "./config";

export default class DocumentRequirementRepository extends BaseRepository {
  public fillables: Array<keyof DocumentRequirementResponseData> =
    documentRequirementConfig.fillables;
  public rules: { [key: string]: string } = documentRequirementRules;
  public views: ViewsProps[] = documentRequirementViews;
  protected state: DocumentRequirementResponseData =
    documentRequirementConfig.state;
  public columns: ColumnData[] = documentRequirementColumns;
  public actions: ButtonsProp[] = documentRequirementConfig.actions;
  public fromJson(
    data: DocumentRequirementResponseData
  ): DocumentRequirementResponseData {
    return {
      id: data.id ?? 0,
      name: data.name ?? "",
      description: data.description ?? "",
      priority: data.priority ?? "low",
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
    };
  }
  public associatedResources: DependencyProps[] =
    documentRequirementConfig.associatedResources;
}
