import { ConfigProp } from "../BaseRepository";
import { PaymentResponseData } from "./data";

export const paymentConfig: ConfigProp<PaymentResponseData> = {
  fillables: [
    "user_id",
    "department_id",
    "workflow_id",
    "document_category_id",
    "document_type_id",
    "payment_batch_id",
    "expenditure_id",
    "narration",
    "total_amount_payable",
    "payable_id",
    "payable_type",
    "payment_method",
    "payment_type",
    "currency",
    "period",
    "fiscal_year",
    "beneficiary",
    "transaction_type",
    "transaction_date",
  ],
  associatedResources: [{ name: "chartOfAccounts", url: "chartOfAccounts" }],
  state: {
    id: 0,
    user_id: 0,
    department_id: 0,
    workflow_id: 0,
    beneficiary: "",
    document_category_id: 0,
    document_type_id: 0,
    payment_batch_id: 0,
    expenditure_id: 0,
    narration: "",
    total_amount_payable: "",
    payable_id: 0,
    payable_type: "",
    payment_method: "bank-transfer",
    transaction_date: "",
    payment_type: "staff",
    currency: "NGN",
    period: "",
    fiscal_year: 0,
    transaction_type: "debit",
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
