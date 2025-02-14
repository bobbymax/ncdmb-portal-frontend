import { BaseResponse } from "../BaseRepository";
import { DocumentActionResponseData } from "../DocumentAction/data";
import { GradeLevelResponseData } from "../GradeLevel/data";

export interface CarderResponseData extends BaseResponse {
  name: string;
  label: string;
  grade_levels: GradeLevelResponseData[];
  actions: DocumentActionResponseData[];
  created_at?: string;
  updated_at?: string;
}
