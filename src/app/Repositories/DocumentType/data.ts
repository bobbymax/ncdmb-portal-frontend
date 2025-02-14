import { BaseResponse } from "../BaseRepository";
import { DocumentCategoryResponseData } from "../DocumentCategory/data";
import { FileTemplateResponseData } from "../FileTemplate/data";
import { WorkflowResponseData } from "../Workflow/data";

export interface DocumentTypeResponseData extends BaseResponse {
  name: string;
  label: string;
  description: string;
  file_template_id: number;
  template: FileTemplateResponseData | null;
  workflow?: WorkflowResponseData | null;
  categories: DocumentCategoryResponseData[];
  created_at?: string;
  updated_at?: string;
}
