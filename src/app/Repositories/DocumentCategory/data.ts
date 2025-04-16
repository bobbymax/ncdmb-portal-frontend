import { DataOptionsProps } from "resources/views/components/forms/MultiSelect";
import { BaseResponse } from "../BaseRepository";
import { DocumentRequirementResponseData } from "../DocumentRequirement/data";

export interface DocumentCategoryResponseData extends BaseResponse {
  document_type_id: number;
  workflow_id: number;
  type: "staff" | "third-party";
  name: string;
  icon: string;
  label: string;
  document_type?: string;
  description: string;
  requirements: DocumentRequirementResponseData[];
  selectedRequirements: DataOptionsProps[];
  created_at?: string;
  updated_at?: string;
}
