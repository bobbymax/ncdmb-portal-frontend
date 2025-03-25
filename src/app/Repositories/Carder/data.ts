import { BaseResponse } from "../BaseRepository";
import { DocumentActionResponseData } from "../DocumentAction/data";
import { GradeLevelResponseData } from "../GradeLevel/data";
import { GroupResponseData } from "../Group/data";

export interface CarderResponseData extends BaseResponse {
  name: string;
  label: string;
  grade_levels: GradeLevelResponseData[];
  actions: DocumentActionResponseData[];
  groups: GroupResponseData[];
  created_at?: string;
  updated_at?: string;
}
