import { BaseResponse } from "../BaseRepository";

export interface InvoiceItemResponseData extends BaseResponse {
  invoice_id?: number;
  description: string;
  qty: number;
  unit_price: number;
  total_amount: number;
  status: "quoted" | "revised" | "delivered";
  created_at?: string;
  updated_at?: string;
}

export interface InvoiceResponseData extends BaseResponse {
  invoiceable_id: number;
  invoiceable_type: string;
  invoice_number: string;
  sub_total_amount: number;
  service_charge: number;
  grand_total_amount: number;
  currency: "NGN" | "USD" | "EUR" | "GBP" | "YEN" | "NA";
  meta_data: unknown;
  status: "pending" | "fulfilled" | "partial" | "defaulted";
  vat: number;
  items: InvoiceItemResponseData[];
  created_at?: string;
  updated_at?: string;
}
