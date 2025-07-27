import { ConfigProp } from "../BaseRepository";
import { InvoiceResponseData } from "./data";

export const invoiceConfig: ConfigProp<InvoiceResponseData> = {
  fillables: [
    "invoiceable_id",
    "invoiceable_type",
    "invoice_number",
    "sub_total_amount",
    "service_charge",
    "grand_total_amount",
    "currency",
    "meta_data",
    "items",
    "vat",
  ],
  associatedResources: [],
  state: {
    id: 0,
    invoiceable_id: 0,
    invoiceable_type: "",
    invoice_number: "",
    sub_total_amount: 0,
    vat: 0,
    service_charge: 0,
    grand_total_amount: 0,
    currency: "NGN",
    status: "pending",
    meta_data: {},
    items: [],
  },
  actions: [
    {
      label: "manage",
      icon: "ri-settings-3-line",
      variant: "success",
      conditions: [],
      operator: "and",
      display: "Manage",
    },
  ],
};
