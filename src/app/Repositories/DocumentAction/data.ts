import { BaseResponse } from "../BaseRepository";

export interface DocumentActionResponseData extends BaseResponse {
  name: string;
  button_text: string;
  url: string;
  frontend_path: string;
  icon: string;
  variant: "primary" | "info" | "warning" | "success" | "danger" | "dark";
  status: string;
  description: string;
  created_at?: string;
  updated_at?: string;
}
