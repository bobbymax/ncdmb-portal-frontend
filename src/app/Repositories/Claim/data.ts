import { BaseResponse, BeneficiaryProps } from "../BaseRepository";
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
  beneficiary?: BeneficiaryProps | null;
  filename?: string;
  deletedExpenses?: ExpenseResponseData[];
  deletedUploads?: UploadResponseData[];
  document_id?: number;
  authorising_officer?: {
    id: number;
    name: string;
    staff_no: string | number;
    grade_level: string;
    email: string;
  } | null;
  claimant_signature: string;
  resident_type?: "resident" | "non-resident";
  distance?: number;
  route?: "one-way" | "return";
  mode?: "flight" | "road";
  departure_city_id?: number;
  destination_city_id?: number;
  airport_id?: number;
  approval_signature: string;
  category_label?: string;
  created_at?: string;
  updated_at?: string;
}
