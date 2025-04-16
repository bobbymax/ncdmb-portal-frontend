import { BaseResponse } from "../BaseRepository";

export interface ChartOfAccountResponseData extends BaseResponse {
  account_code: string;
  name: string;
  type: "asset" | "liability" | "equity" | "revenue" | "expense";
  parent_id: number;
  level: "category" | "group" | "ledger";
  status: "C" | "O";
  is_postable: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}
