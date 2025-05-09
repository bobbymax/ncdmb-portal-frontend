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
import { PaymentResponseData } from "./data";
import { paymentRules } from "./rules";
import { paymentViews } from "./views";
import { paymentColumns } from "./columns";
import { paymentConfig } from "./config";

export default class PaymentRepository extends BaseRepository {
  public fillables: Array<keyof PaymentResponseData> = paymentConfig.fillables;
  public rules: { [key: string]: string } = paymentRules;
  public views: ViewsProps[] = paymentViews;
  protected state: PaymentResponseData = paymentConfig.state;
  public columns: ColumnData[] = paymentColumns;
  public actions: ButtonsProp[] = paymentConfig.actions;
  public fromJson = (data: JsonResponse): PaymentResponseData => {
    return {
      id: data.id ?? 0,
      user_id: data.user_id ?? 0,
      department_id: data.department_id ?? 0,
      workflow_id: data.workflow_id ?? 0,
      document_category_id: data.document_category_id ?? 0,
      document_type_id: data.document_type_id ?? 0,
      payment_batch_id: data.payment_batch_id ?? 0,
      expenditure_id: data.expenditure_id ?? 0,
      narration: data.narration ?? "",
      total_amount_payable: data.total_amount_payable ?? "",
      total_amount_paid: data.total_amount_paid ?? 0,
      total_approved_amount: data.total_approved_amount ?? 0,
      total_taxable_amount: data.total_taxable_amount ?? 0,
      payable_id: data.payable_id ?? 0,
      payable_type: data.payable_type ?? "",
      payment_method: data.payment_method ?? "bank-transfer",
      type: data.type ?? "staff",
      currency: data.currency ?? "NGN",
      transaction_date: data.transaction_date ?? "",
      period: data.period ?? "",
      fiscal_year: data.fiscal_year ?? 0,
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
    };
  };
  public associatedResources: DependencyProps[] =
    paymentConfig.associatedResources;
}
