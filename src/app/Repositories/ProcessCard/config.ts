import { ConfigProp } from "../BaseRepository";
import { ProcessCardResponseData } from "./data";

export const processCardConfig: ConfigProp<ProcessCardResponseData> = {
  fillables: [
    "document_type_id",
    "ledger_id",
    "service",
    "name",
    "component",
    "rules",
    "is_disabled",
  ],
  associatedResources: [
    { url: "apiServices", name: "services" },
    { name: "documentTypes", url: "documentTypes" },
    { name: "ledgers", url: "ledgers" },
    { name: "groups", url: "groups" },
    { name: "carders", url: "carders" },
  ],
  state: {
    id: 0,
    document_type_id: 0,
    ledger_id: 0,
    service: "",
    name: "",
    component: "",
    rules: {
      currency: "NGN",
      transaction: "debit",
      generate_transactions: false,
      permission: "r",
      visibility: "tracker-users",
      requires_approval: false,
      can_query: false,
      group_id: 0,
      settle: false,
      settle_after_approval: false,
      ai_analysis: false,
      approval_carder_id: 0,
    },
    is_disabled: false,
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
