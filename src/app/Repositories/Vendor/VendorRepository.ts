import {
  ColumnData,
  ButtonsProp,
} from "resources/views/components/tables/CustomDataTable";
import { BaseRepository, DependencyProps, ViewsProps } from "../BaseRepository";
import { VendorResponseData } from "./data";
import { vendorRules } from "./rules";
import { vendorViews } from "./views";
import { vendorColumns } from "./columns";
import { vendorConfig } from "./config";

export default class VendorRepository extends BaseRepository {
  public fillables: Array<keyof VendorResponseData> = vendorConfig.fillables;
  public rules: { [key: string]: string } = vendorRules;
  public views: ViewsProps[] = vendorViews;
  protected state: VendorResponseData = vendorConfig.state;
  public columns: ColumnData[] = vendorColumns;
  public actions: ButtonsProp[] = vendorConfig.actions;
  public fromJson(data: VendorResponseData): VendorResponseData {
    return {
      id: data.id ?? 0,
      name: data.name ?? "",
      representative_name: data.representative_name ?? "",
      authorising_representative: data.authorising_representative ?? "",
      phone: data.phone ?? "",
      email: data.email ?? "",
      ncec_no: data.ncec_no ?? "",
      reg_no: data.reg_no ?? "",
      tin_number: data.tin_number ?? "",
      address: data.address ?? "",
      bank_account_name: data.bank_account_name ?? "",
      bank_account_number: data.bank_account_number ?? "",
      bank_name: data.bank_name ?? "",
      payment_code: data.payment_code ?? "",
      website: data.website ?? "",
      logo: data.logo ?? "",
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
    };
  }
  public associatedResources: DependencyProps[] =
    vendorConfig.associatedResources;
}
