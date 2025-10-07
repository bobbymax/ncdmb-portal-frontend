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
import { ExpenditureResponseData } from "./data";
import { expenditureRules } from "./rules";
import { expenditureViews } from "./views";
import { expenditureColumns } from "./columns";
import { expenditureConfig } from "./config";

export default class ExpenditureRepository extends BaseRepository {
  public fillables: Array<keyof ExpenditureResponseData> =
    expenditureConfig.fillables;
  public rules: { [key: string]: string } = expenditureRules;
  public views: ViewsProps[] = expenditureViews;
  protected state: ExpenditureResponseData = expenditureConfig.state;
  public columns: ColumnData[] = expenditureColumns;
  public actions: ButtonsProp[] = expenditureConfig.actions;
  public fromJson(data: JsonResponse): ExpenditureResponseData {
    return {
      id: data.id ?? 0,
      user_id: data.user_id ?? 0,
      department_id: data.department_id ?? 0,
      fund_id: data.fund_id ?? 0,
      document_draft_id: data.document_draft_id ?? 0,
      linked_document: data.linked_document ?? null,
      code: data.code ?? "",
      purpose: data.purpose ?? "",
      additional_info: data.additional_info ?? "",
      amount: data.amount ?? "",
      sub_total_amount: data.sub_total_amount ?? 0,
      admin_fee_amount: data.admin_fee_amount ?? 0,
      vat_amount: data.vat_amount ?? 0,
      type: data.type ?? "",
      status: data.status ?? "",
      currency: data.currency ?? "NGN",
      cbn_current_rate: data.cbn_current_rate ?? "",
      budget_year: data.budget_year ?? 0,
      expense_type: data.expense_type ?? "staff",
      is_archived: data.is_archived ?? 0,
      fund: data.fund ?? null,
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
    };
  }
  public associatedResources: DependencyProps[] =
    expenditureConfig.associatedResources;
}
