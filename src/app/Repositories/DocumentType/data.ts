import { BaseResponse } from "../BaseRepository";
import { DocumentCategoryResponseData } from "../DocumentCategory/data";
import { WorkflowResponseData } from "../Workflow/data";

export interface DocumentTypeResponseData extends BaseResponse {
  name: string;
  label: string;
  description: string;
  workflow?: WorkflowResponseData | null;
  categories: DocumentCategoryResponseData[];
  created_at?: string;
  updated_at?: string;
}
