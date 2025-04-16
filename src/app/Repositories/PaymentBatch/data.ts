import { BaseResponse } from "../BaseRepository";
import { ExpenditureResponseData } from "../Expenditure/data";

export interface PaymentBatchResponseData extends BaseResponse {
  user_id: number;
  department_id: number;
  fund_id: number;
  workflow_id?: number;
  document_type_id?: number;
  document_category_id?: number;
  code?: string;
  description?: string;
  budget_year: number;
  type: "staff" | "third-party";
  status: string;
  expenditures: ExpenditureResponseData[];
  department?: string;
  directorate?: string;
  created_at?: string;
  updated_at?: string;
}
