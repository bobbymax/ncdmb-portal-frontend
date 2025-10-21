import { BaseResponse } from "../BaseRepository";

export interface PostingRules {
  create_contra_entries: boolean;
  retirement: boolean;
  resolve_on_retirement: boolean;
}

export interface JournalTypeResponseData extends BaseResponse {
  ledger_id: number;
  entity_id: number;
  name: string;
  code: string;
  is_taxable: number;
  tax_rate: number;
  rate: number;
  rate_type: "percent" | "fixed";
  kind: "add" | "deduct" | "info";
  base_selector: "GROSS" | "TAXABLE" | "NON-TAXABLE" | "CUSTOM";
  fixed_amount: number;
  deductible_from_taxable: boolean;
  precedence: number;
  rounding: "half_up" | "bankers";
  is_vat: boolean;
  deductible: "total" | "non-taxable" | "taxable";
  context:
    | "tax"
    | "stamp"
    | "commission"
    | "holding"
    | "gross"
    | "net"
    | "reimbursement";
  state: "fixed" | "optional";
  type: "credit" | "debit" | "both";
  category: "staff" | "third-party" | "default";
  auto_generate_entries: number;
  auto_post_to_ledger: boolean;
  requires_approval: boolean;
  posting_rules: PostingRules;
  benefactor: "beneficiary" | "entity";
  flag: "payable" | "ledger" | "retire";
  description?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}
