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
import { PaymentBatchResponseData } from "./data";
import { paymentBatchRules } from "./rules";
import { paymentBatchViews } from "./views";
import { paymentBatchColumns } from "./columns";
import { paymentBatchConfig } from "./config";

export default class PaymentBatchRepository extends BaseRepository {
  public fillables: Array<keyof PaymentBatchResponseData> =
    paymentBatchConfig.fillables;
  public rules: { [key: string]: string } = paymentBatchRules;
  public views: ViewsProps[] = paymentBatchViews;
  protected state: PaymentBatchResponseData = paymentBatchConfig.state;
  public columns: ColumnData[] = paymentBatchColumns;
  public actions: ButtonsProp[] = paymentBatchConfig.actions;
  public fromJson(data: JsonResponse): PaymentBatchResponseData {
    return {
      id: data.id ?? 0,
      user_id: data.user_id ?? 0,
      department_id: data.department_id ?? 0,
      fund_id: data.fund_id ?? 0,
      code: data.code ?? "",
      description: data.description ?? "",
      budget_year: data.budget_year ?? 0,
      type: data.type ?? "staff",
      directorate: data.directorate ?? "",
      department: data.department ?? "",
      status: data.status ?? "",
      expenditures: data.expenditures ?? [],
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
    };
  }
  public associatedResources: DependencyProps[] =
    paymentBatchConfig.associatedResources;
}
