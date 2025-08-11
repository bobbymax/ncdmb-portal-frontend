import { BaseResponse } from "../BaseRepository";
import { CarderResponseData } from "../Carder/data";

export interface GradeLevelResponseData extends BaseResponse {
  name: string;
  key: string;
  type: "system" | "board";
  carder_id: number;
  carder: CarderResponseData | null;
  rank: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
  created_at?: string;
  updated_at?: string;
}
