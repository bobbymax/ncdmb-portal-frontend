import { BaseResponse } from "../BaseRepository";
import { CarderResponseData } from "../Carder/data";

export interface GradeLevelResponseData extends BaseResponse {
  name: string;
  key: string;
  type: "system" | "board";
  carder_id: number;
  carder: CarderResponseData | null;
  created_at?: string;
  updated_at?: string;
}
