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
import { JournalTypeResponseData } from "./data";
import { journalTypeRules } from "./rules";
import { journalTypeViews } from "./views";
import { journalTypeColumns } from "./columns";
import { journalTypeConfig } from "./config";

export default class JournalTypeRepository extends BaseRepository {
  public fillables: Array<keyof JournalTypeResponseData> =
    journalTypeConfig.fillables;
  public rules: { [key: string]: string } = journalTypeRules;
  public views: ViewsProps[] = journalTypeViews;
  protected state: JournalTypeResponseData = journalTypeConfig.state;
  public columns: ColumnData[] = journalTypeColumns;
  public actions: ButtonsProp[] = journalTypeConfig.actions;
  public fromJson(data: JsonResponse): JournalTypeResponseData {
    return {
      id: data.id ?? 0,
      ledger_id: data.ledger_id ?? 0,
      entity_id: data.entity_id ?? 0,
      code: data.code ?? "",
      is_taxable: data.is_taxable ?? 0,
      tax_rate: data.tax_rate ?? 0,
      deductible: data.deductible ?? "taxable",
      state: data.state ?? "optional",
      type: data.type ?? "debit",
      context: data.context ?? "tax",
      benefactor: data.benefactor ?? "beneficiary",
      category: data.category ?? "default",
      flag: data.flag ?? "payable",
      auto_generate_entries: data.auto_generate_entries ?? 0,
      description: data.description ?? "",
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
      deleted_at: data.deleted_at ?? "",
    };
  }
  public associatedResources: DependencyProps[] =
    journalTypeConfig.associatedResources;
}
