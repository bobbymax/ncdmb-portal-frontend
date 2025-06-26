import { ConfigProp } from "../BaseRepository";
import { JournalTypeResponseData } from "./data";

export const journalTypeConfig: ConfigProp<JournalTypeResponseData> = {
  fillables: [
    "ledger_id",
    "entity_id",
    "code",
    "is_taxable",
    "tax_rate",
    "deductible",
    "type",
    "auto_generate_entries",
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
    code: "",
    is_taxable: 0,
    tax_rate: 0,
    deductible: "taxable",
    type: "debit",
    context: "tax",
    state: "optional",
    benefactor: "beneficiary",
    category: "default",
    flag: "payable",
    auto_generate_entries: 0,
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
