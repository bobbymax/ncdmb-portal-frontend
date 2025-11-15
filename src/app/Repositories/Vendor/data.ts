import { BaseResponse } from "../BaseRepository";

export interface VendorResponseData extends BaseResponse {
  name: string;
  representative_name: string;
  authorising_representative: string;
  phone: string;
  email: string;
  ncec_no: string;
  reg_no: string;
  tin_number: string;
  address: string;
  bank_account_name: string;
  bank_account_number: string;
  bank_name: string;
  payment_code: string;
  website: string;
  logo: string;
  created_at?: string;
  updated_at?: string;
}
