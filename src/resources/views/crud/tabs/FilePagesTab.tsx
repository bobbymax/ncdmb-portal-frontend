import { DocumentResponseData } from "app/Repositories/Document/data";
import DocumentRepository from "app/Repositories/Document/DocumentRepository";
import { FileTemplateResponseData } from "app/Repositories/FileTemplate/data";
import { ProgressTrackerResponseData } from "app/Repositories/ProgressTracker/data";
import {
  WorkflowStageGroupProps,
  WorkflowStageResponseData,
} from "app/Repositories/WorkflowStage/data";
import React, { Suspense, useCallback } from "react";
import Button from "resources/views/components/forms/Button";
import { DocumentUpdateResponseData } from "app/Repositories/DocumentUpdate/data";
import { DocumentDraftResponseData } from "app/Repositories/DocumentDraft/data";
import { WorkflowResponseData } from "app/Repositories/Workflow/data";
import { DocumentNoteComponentProps } from "../templates/DispatchNoteComponent";
import { TabModelProps, useFilePages } from "app/Hooks/useFilePages";
import { DocketDataType, useWorkflowEngine } from "app/Hooks/useWorkflowEngine";
import { DocumentActionResponseData } from "app/Repositories/DocumentAction/data";
import useDocketPipelines from "app/Hooks/useDocketPipelines";
import { repo, service } from "bootstrap/repositories";
import { useAuth } from "app/Context/AuthContext";

export type ServerDocumentRequestProps = {
  document: DocumentResponseData;
  response: DocumentUpdateResponseData;
  service: string;
};

export interface DraftPageProps<T = TabModelProps> {
  data: DocumentNoteComponentProps;
  template: FileTemplateResponseData | null;
  index: number;
  group: WorkflowStageGroupProps | null;
  stage: WorkflowStageResponseData | null;
  draftId: number;
  drafts?: DocumentDraftResponseData[];
  tracker?: ProgressTrackerResponseData | null;
  workflow: WorkflowResponseData | null;
  updateLocalState: (localState: T) => void;
}

const FilePagesTab: React.FC<
  DocketDataType<DocumentResponseData, DocumentRepository>
> = ({
  workflow,
  currentTracker,
  currentDraft,
  drafts,
  group,
  currentStage,
  availableActions,
  docType,
  uploads,
  resource,
  nextTracker,
  needsSignature,
  document,
  Repo,
  updateRaw,
  fill,
  fileState,
  draftTemplates,
}) => {
  const { serverState, resolve } = useDocketPipelines(
    resource,
    availableActions,
    currentDraft
  );

  console.log(service("dispatch-note"));

  const resolveAction = useCallback(
    (action: DocumentActionResponseData) => {
      // Check if this tracker needs to have a signature
      if (needsSignature && fileState.signature === "") return false;
    },
    [needsSignature, fileState, nextTracker, currentDraft, currentTracker]
  );

  // console.log(fileState, serverState);

  // console.log(service(currentDraft.document_draftable_type));

  const updateLocalState = () => {};

  // console.log(fileState);

  return (
    <>
      {/* Document Actions Section */}
      <div className="document__actions__container">
        <div className="action__box flex align gap-sm">
          {availableActions &&
            availableActions.map((action, i) => (
              <Button
                key={i}
                label={action.button_text}
                icon={action.icon}
                handleClick={() => resolve(action, fileState, nextTracker)}
                size="sm"
                variant={action.variant}
                isDisabled={action?.disabled ?? true}
              />
            ))}
        </div>
      </div>

      {draftTemplates &&
        draftTemplates.map(({ id, component: DraftTemplateComponent }) => (
          <Suspense key={id} fallback={<div>Loading...</div>}>
            <DraftTemplateComponent
              data={drafts.find((d) => d.id === id)?.draftable}
              draftId={id}
              template={drafts.find((d) => d.id === id)?.template}
              group={group}
              stage={currentStage}
              updateLocalState={updateLocalState}
              drafts={drafts}
              tracker={currentTracker}
              workflow={workflow}
              needsSignature={needsSignature}
              nextTracker={nextTracker}
              resource={resource}
              uploads={uploads}
              fill={fill}
              fileState={fileState}
              docType={docType}
              currentDraft={currentDraft}
            />
          </Suspense>
        ))}
    </>
  );
};

export default FilePagesTab;
