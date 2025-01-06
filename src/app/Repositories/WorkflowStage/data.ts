import { DataOptionsProps } from "resources/views/components/forms/MultiSelect";
import { BaseResponse } from "../BaseRepository";
import { DocumentActionResponseData } from "../DocumentAction/data";
import { DocumentRequirementResponseData } from "../DocumentRequirement/data";

export interface WorkflowStageResponseData extends BaseResponse {
  group_id: number;
  workflow_stage_category_id: number;
  assistant_group_id: number;
  department_id: number;
  name: string;
  actions: DocumentActionResponseData[];
  fallback_stage_id: number;
  flag: "passed" | "failed" | "stalled";
  alert_recipients: number;
  supporting_documents_verified: boolean;
  selectedActions?: DataOptionsProps[];
  documentsRequired?: DocumentRequirementResponseData[];
  selectedDocumentsRequired?: DataOptionsProps[];
  recipients: DataOptionsProps[];
  created_at?: string;
  updated_at?: string;
}
