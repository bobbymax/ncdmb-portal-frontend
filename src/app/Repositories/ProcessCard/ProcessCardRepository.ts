import {
  ColumnData,
  ButtonsProp,
} from "resources/views/components/tables/CustomDataTable";
import { BaseRepository, DependencyProps, ViewsProps } from "../BaseRepository";
import { ProcessCardResponseData } from "./data";
import { processCardRules } from "./rules";
import { processCardViews } from "./views";
import { processCardColumns } from "./columns";
import { processCardConfig } from "./config";

export default class ProcessCardRepository extends BaseRepository {
  public fillables: Array<keyof ProcessCardResponseData> =
    processCardConfig.fillables;
  public rules: { [key: string]: string } = processCardRules;
  public views: ViewsProps[] = processCardViews;
  protected state: ProcessCardResponseData = processCardConfig.state;
  public columns: ColumnData[] = processCardColumns;
  public actions: ButtonsProp[] = processCardConfig.actions;
  public fromJson(data: ProcessCardResponseData): ProcessCardResponseData {
    return {
      id: data.id ?? 0,
      document_type_id: data.document_type_id ?? 0,
      ledger_id: data.ledger_id ?? 0,
      service: data.service ?? "",
      name: data.name ?? "",
      component: data.component ?? "",
      rules: data.rules ?? [],
      is_disabled: data.is_disabled ?? false,
      document_type: data.document_type ?? null,
      ledger: data.ledger ?? null,
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
    };
  }
  public associatedResources: DependencyProps[] =
    processCardConfig.associatedResources;
}
