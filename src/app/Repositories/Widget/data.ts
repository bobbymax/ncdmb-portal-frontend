import { DataOptionsProps } from "resources/views/components/forms/MultiSelect";
import { BaseResponse } from "../BaseRepository";

export interface WidgetResponseData extends BaseResponse {
  document_type_id: number;
  department_id: number;
  title: string;
  component: string;
  chart_type: "none" | "bar" | "pie" | "line" | "mixed";
  is_active: number;
  response: "resource" | "collection";
  type: "box" | "card" | "chart" | "banner" | "breadcrumb";
  progress_tracker_id: number;
  groups: DataOptionsProps[];
  created_at?: string;
  updated_at?: string;
}
