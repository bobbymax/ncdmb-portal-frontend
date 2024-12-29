import { DataOptionsProps } from "resources/views/components/forms/MultiSelect";
import { BaseResponse } from "../BaseRepository";
import { DocumentActionResponseData } from "../DocumentAction/data";
import { DocumentRequirementResponseData } from "../DocumentRequirement/data";

export interface WorkflowStageResponseData extends BaseResponse {
  workflow_id: number;
  group_id: number;
  department_id: number;
  name: string;
  order: number;
  actions: DocumentActionResponseData[];
  selectedActions?: DataOptionsProps[];
  documentsRequired?: DocumentRequirementResponseData[];
  selectedDocumentsRequired?: DataOptionsProps[];
  recipients: DataOptionsProps[];
  created_at?: string;
  updated_at?: string;
}
