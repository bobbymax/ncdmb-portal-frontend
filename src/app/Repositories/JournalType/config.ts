import { ConfigProp } from "../BaseRepository";
import { JournalTypeResponseData } from "./data";

export const journalTypeConfig: ConfigProp<JournalTypeResponseData> = {
  fillables: [
    "ledger_id",
    "entity_id",
    "name",
    "description",
    "code",
    "is_taxable",
    "tax_rate",
    "rate",
    "rate_type",
    "kind",
    "base_selector",
    "fixed_amount",
    "deductible_from_taxable",
    "precedence",
    "rounding",
    "is_vat",
    "deductible",
    "type",
    "auto_generate_entries",
    "auto_post_to_ledger",
    "requires_approval",
    "posting_rules",
    "context",
    "state",
    "description",
    "benefactor",
    "category",
    "flag",
  ],
  associatedResources: [
    { name: "ledgers", url: "ledgers" },
    { name: "entities", url: "entities" },
  ],
  state: {
    id: 0,
    ledger_id: 0,
    entity_id: 0,
    name: "",
    description: "",
    code: "",
    is_taxable: 0, // ignore
    tax_rate: 0, // ignore
    rate: 0,
    rate_type: "percent",
    kind: "add",
    base_selector: "GROSS",
    fixed_amount: 0,
    deductible_from_taxable: false,
    precedence: 0,
    rounding: "half_up",
    is_vat: false,
    deductible: "taxable", // ignore
    auto_post_to_ledger: false, // ignore
    requires_approval: false, // ignore
    posting_rules: {
      create_contra_entries: false,
      retirement: false,
      resolve_on_retirement: false,
    },
    type: "debit", // ignore
    context: "tax",
    state: "optional", // ignore
    benefactor: "beneficiary", // ignore
    category: "default",
    flag: "payable", // ignore
    auto_generate_entries: 0, // ignore
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
