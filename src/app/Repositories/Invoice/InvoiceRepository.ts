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
import { InvoiceResponseData } from "./data";
import { invoiceRules } from "./rules";
import { invoiceViews } from "./views";
import { invoiceColumns } from "./columns";
import { invoiceConfig } from "./config";

export default class InvoiceRepository extends BaseRepository {
  public fillables: Array<keyof InvoiceResponseData> = invoiceConfig.fillables;
  public rules: { [key: string]: string } = invoiceRules;
  public views: ViewsProps[] = invoiceViews;
  protected state: InvoiceResponseData = invoiceConfig.state;
  public columns: ColumnData[] = invoiceColumns;
  public actions: ButtonsProp[] = invoiceConfig.actions;
  public fromJson(data: JsonResponse): InvoiceResponseData {
    return {
      id: data.id ?? 0,
      invoiceable_id: data.invoiceable_id ?? 0,
      invoiceable_type: data.invoiceable_type ?? "",
      invoice_number: data.invoice_number ?? "",
      sub_total_amount: data.sub_total_amount ?? 0,
      service_charge: data.service_charge ?? 0,
      grand_total_amount: data.grand_total_amount ?? 0,
      vat: data.vat ?? 0,
      currency: data.currency ?? "NGN",
      meta_data: data.meta_data ?? {},
      items: data.items ?? [],
      status: data.status ?? "pending",
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
    };
  }
  public associatedResources: DependencyProps[] =
    invoiceConfig.associatedResources;
}
