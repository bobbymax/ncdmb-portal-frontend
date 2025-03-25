import { BaseResponse } from "../BaseRepository";
import { WorkflowStageResponseData } from "../WorkflowStage/data";
import { DocumentTypeResponseData } from "../DocumentType/data";
import { CarderResponseData } from "../Carder/data";
import { GroupResponseData } from "../Group/data";
import { DataOptionsProps } from "resources/views/components/forms/MultiSelect";
import { DocumentActionResponseData } from "../DocumentAction/data";

export type ServerTrackerData = {
  id: number;
  identifier: string;
  workflow_stage_id: number;
  group_id: number;
  department_id: number;
  carder_id: number;
  document_type_id: number;
  signatory_id: number;
  order: number;
  stage_name: string;
  actions: DataOptionsProps[];
  recipients: DataOptionsProps[];
};

export interface ProgressTrackerResponseData extends BaseResponse {
  workflow_id: number;
  workflow_stage_id: number;
  identifier?: string;
  document_type_id: number;
  group_id: number;
  carder_id: number;
  department_id: number;
  signatory_id: number;
  order: number;
  stage: WorkflowStageResponseData | null;
  stages?: ServerTrackerData[];
  group: GroupResponseData | null;
  document_type: DocumentTypeResponseData | null;
  carder: CarderResponseData | null;
  actions: DataOptionsProps[];
  recipients: DataOptionsProps[];
  loadedActions: DocumentActionResponseData[];
  department?: {
    name: string;
    abv: string;
  };
  created_at?: string;
  updated_at?: string;
}
