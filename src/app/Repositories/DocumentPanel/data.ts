import { BaseResponse } from "../BaseRepository";
import { DocumentCategoryResponseData } from "../DocumentCategory/data";
import { GroupResponseData } from "../Group/data";

export interface DocumentPanelResponseData extends BaseResponse {
  document_category_id: number;
  name: string;
  label: string;
  icon: string;
  component_path: string;
  order: number;
  document_status: string;
  is_active: boolean;
  is_editor_only: boolean;
  is_view_only: boolean;
  visibility_mode: "both" | "editor" | "preview";
  is_global: boolean;
  document_category: DocumentCategoryResponseData | null;
  groups?: GroupResponseData[];
  created_at?: string;
  updated_at?: string;
}
