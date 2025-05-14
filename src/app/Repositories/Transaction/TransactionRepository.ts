import {
  ColumnData,
  ButtonsProp,
} from "resources/views/components/tables/CustomDataTable";
import { BaseRepository, DependencyProps, ViewsProps } from "../BaseRepository";
import { TransactionResponseData } from "./data";
import { transactionRules } from "./rules";
import { transactionViews } from "./views";
import { transactionColumns } from "./columns";
import { transactionConfig } from "./config";

export default class TransactionRepository extends BaseRepository {
  public fillables: Array<keyof TransactionResponseData> =
    transactionConfig.fillables;
  public rules: { [key: string]: string } = transactionRules;
  public views: ViewsProps[] = transactionViews;
  protected state: TransactionResponseData = transactionConfig.state;
  public columns: ColumnData[] = transactionColumns;
  public actions: ButtonsProp[] = transactionConfig.actions;
  public fromJson(data: TransactionResponseData): TransactionResponseData {
    return {
      id: data.id ?? 0,
      user_id: data.user_id ?? 0,
      department_id: data.department_id ?? 0,
      payment_id: data.payment_id ?? 0,
      ledger_id: data.ledger_id ?? 0,
      chart_of_account_id: data.chart_of_account_id ?? 0,
      reference: data.reference ?? "",
      type: data.type ?? "credit",
      amount: data.amount ?? 0,
      narration: data.narration ?? "",
      beneficiary_id: data.beneficiary_id ?? 0,
      beneficiary_type: data.beneficiary_type ?? "",
      payment_method: data.payment_method ?? "bank-transfer",
      currency: data.currency ?? "NGN",
      status: data.status ?? "",
      posted_at: data.posted_at ?? "",
      is_achived: data.is_achived ?? 0,
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
      deleted_at: data.deleted_at ?? "",
    };
  }
  public associatedResources: DependencyProps[] =
    transactionConfig.associatedResources;
}
