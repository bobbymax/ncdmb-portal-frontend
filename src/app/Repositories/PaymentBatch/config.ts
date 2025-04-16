import { ConfigProp } from "../BaseRepository";
import { PaymentBatchResponseData } from "./data";

export const paymentBatchConfig: ConfigProp<PaymentBatchResponseData> = {
  fillables: [
    "user_id",
    "department_id",
    "fund_id",
    "description",
    "budget_year",
    "type",
    "expenditures",
    "workflow_id",
    "document_type_id",
    "document_category_id",
  ],
  associatedResources: [
    { name: "chartOfAccounts", url: "chartOfAccounts" },
    { name: "ledgers", url: "group/ledgers" },
  ],
  state: {
    id: 0,
    user_id: 0,
    department_id: 0,
    fund_id: 0,
    description: "",
    budget_year: 0,
    type: "staff",
    status: "",
    expenditures: [],
    workflow_id: 0,
    document_type_id: 0,
    document_category_id: 0,
  },
  actions: [],
};
