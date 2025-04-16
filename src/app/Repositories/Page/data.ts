import { DataOptionsProps } from "resources/views/components/forms/MultiSelect";
import { BaseResponse } from "../BaseRepository";
import { WorkflowResponseData } from "../Workflow/data";
import { DocumentTypeResponseData } from "../DocumentType/data";
import { SignatoryResponseData } from "../Signatory/data";
import { DocumentCategoryResponseData } from "../DocumentCategory/data";

export interface AuthPageResponseData extends BaseResponse {
  icon: string;
  is_default: boolean;
  is_menu: boolean;
  label: string;
  path: string;
  name: string;
  parent_id: number;
  workflow_id: number;
  document_type_id: number;
  image_path: string;
  type: "app" | "index" | "view" | "form" | "external" | "dashboard" | "report";
  roles?: DataOptionsProps[];
  categories?: DocumentCategoryResponseData[];
  signatories?: SignatoryResponseData[];
  workflow: WorkflowResponseData | null;
  documentType: DocumentTypeResponseData | null;
  created_at?: string;
  updated_at?: string;
}
