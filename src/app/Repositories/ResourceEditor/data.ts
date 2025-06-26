import { BaseResponse } from "../BaseRepository";

export interface ResourceEditorResponseData extends BaseResponse {
  group_id: number;
  workflow_id: number;
  workflow_stage_id: number;
  service_name: string;
  resource_column_name: string;
  permission: "r" | "rw" | "rwx";
  service_update: "d" | "dr" | "drn";
  created_at?: string;
  updated_at?: string;
}
