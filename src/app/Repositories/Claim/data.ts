import { BaseResponse } from "../BaseRepository";
import { ExpenseResponseData } from "../Expense/data";
import { TripResponseData } from "../Trip/data";

export interface ClaimResponseData extends BaseResponse {
  user_id?: number;
  department_id?: number;
  workflow_id?: number;
  document_category_id: number;
  document_type_id: number;
  code?: string;
  title: string;
  total_amount_spent: number;
  total_amount_approved: number;
  total_amount_retired: number;
  sponsoring_department_id: number;
  type: "claim" | "retirement";
  start_date: string;
  end_date: string;
  status?:
    | "pending"
    | "registered"
    | "raised"
    | "batched"
    | "queried"
    | "paid"
    | "draft";
  retired?: boolean;
  trips?: TripResponseData[];
  expenses: ExpenseResponseData[];
  supporting_documents: File[];
  filename?: string;
  created_at?: string;
  updated_at?: string;
}
