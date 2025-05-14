import { ConfigProp } from "../BaseRepository";
import { TransactionResponseData } from "./data";

export const transactionConfig: ConfigProp<TransactionResponseData> = {
  fillables: [
    "user_id",
    "department_id",
    "payment_id",
    "ledger_id",
    "chart_of_account_id",
    "type",
    "amount",
    "narration",
    "beneficiary_id",
    "beneficiary_type",
    "payment_method",
    "currency",
  ],
  associatedResources: [
    { name: "ledgers", url: "ledgers" },
    { name: "chartOfAccounts", url: "chartOfAccounts" },
    { name: "entities", url: "entities" },
    { name: "vendors", url: "vendors" },
    { name: "users", url: "users" },
  ],
  state: {
    id: 0,
    user_id: 0,
    department_id: 0,
    payment_id: 0,
    ledger_id: 0,
    chart_of_account_id: 0,
    type: "credit",
    amount: 0,
    narration: "",
    beneficiary_id: 0,
    beneficiary_type: "",
    payment_method: "bank-transfer",
    currency: "NGN",
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
