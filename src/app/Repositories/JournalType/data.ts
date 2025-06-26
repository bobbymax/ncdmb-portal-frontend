import { BaseResponse } from "../BaseRepository";

export interface JournalTypeResponseData extends BaseResponse {
  ledger_id: number;
  entity_id: number;
  code: string;
  is_taxable: number;
  tax_rate: number;
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
  benefactor: "beneficiary" | "entity";
  flag: "payable" | "ledger" | "retire";
  description?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}
