import { BaseResponse } from "../BaseRepository";
import { DocumentResponseData, UploadResponseData } from "../Document/data";
import { ExpenseResponseData } from "../Expense/data";
import { TripResponseData } from "../Trip/data";

type ClaimOwnerProps = {
  staff_no: string;
  grade_level: string;
  name: string;
};

export interface ClaimResponseData extends BaseResponse {
  user_id: number;
  department_id?: number;
  workflow_id?: number;
  document_category_id: number;
  document_type_id: number;
  authorising_staff_id: number;
  code?: string;
  title: string;
  total_amount_spent: number;
  total_amount_approved: number;
  total_amount_retired: number;
  sponsoring_department_id: number;
  department_name?: string;
  type: "claim" | "retirement";
  start_date: string;
  end_date: string;
  status?: string;
  retired?: boolean;
  trips?: TripResponseData[];
  expenses: ExpenseResponseData[];
  owner: ClaimOwnerProps | null;
  supporting_documents: File[];
  uploads?: UploadResponseData[];
  filename?: string;
  deletedExpenses?: ExpenseResponseData[];
  deletedUploads?: UploadResponseData[];
  authorising_officer?: {
    id: number;
    name: string;
    staff_no: string | number;
    grade_level: string;
    email: string;
  } | null;
  claimant_signature: string;
  approval_signature: string;
  created_at?: string;
  updated_at?: string;
}
