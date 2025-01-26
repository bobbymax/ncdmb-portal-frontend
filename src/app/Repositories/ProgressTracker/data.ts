import { DataOptionsProps } from "resources/views/components/forms/MultiSelect";
import { BaseResponse } from "../BaseRepository";
import { DocumentActionResponseData } from "../DocumentAction/data";
import { MailingListResponseData } from "../MailingList/data";
import { WorkflowStageResponseData } from "../WorkflowStage/data";

export interface ProgressTrackerResponseData extends BaseResponse {
  workflow_id: number;
  workflow_stage_id: number;
  document_type_id: number;
  fallback_to_stage_id: number;
  return_to_stage_id: number;
  stage: WorkflowStageResponseData | null;
  trackerActions: DocumentActionResponseData[];
  trackerRecipients: MailingListResponseData[];
  workflow_stage_name?: string;
  order: number;
  created_at?: string;
  updated_at?: string;
}
