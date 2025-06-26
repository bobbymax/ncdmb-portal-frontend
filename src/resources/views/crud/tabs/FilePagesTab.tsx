import { DocumentResponseData } from "app/Repositories/Document/data";
import DocumentRepository from "app/Repositories/Document/DocumentRepository";
import { FileTemplateResponseData } from "app/Repositories/FileTemplate/data";
import { ProgressTrackerResponseData } from "app/Repositories/ProgressTracker/data";
import {
  WorkflowStageGroupProps,
  WorkflowStageResponseData,
} from "app/Repositories/WorkflowStage/data";
import React, { Suspense, useMemo } from "react";
import Button from "resources/views/components/forms/Button";
import { DocumentDraftResponseData } from "app/Repositories/DocumentDraft/data";
import { WorkflowResponseData } from "app/Repositories/Workflow/data";
import {
  DocketDataType,
  ServerDataRequestProps,
} from "app/Hooks/useWorkflowEngine";
import { useFileDeskRoutePipelines } from "app/Hooks/useFileDeskRoutePipelines";
import { BaseRepository, BaseResponse } from "app/Repositories/BaseRepository";
import { SignatoryResponseData } from "app/Repositories/Signatory/data";
import { DocumentActionResponseData } from "app/Repositories/DocumentAction/data";
import { SignatureResponseData } from "app/Repositories/Signature/data";

export interface DraftPageProps<
  T extends BaseResponse,
  D extends BaseRepository
> {
  resource: T;
  repo: D;
  data: T;
  document: DocumentResponseData;
  template: FileTemplateResponseData | null;
  index: number;
  group: WorkflowStageGroupProps | null;
  stage: WorkflowStageResponseData | null;
  draftId: number;
  drafts?: DocumentDraftResponseData[];
  tracker: ProgressTrackerResponseData | null;
  workflow: WorkflowResponseData | null;
  currentDraft: DocumentDraftResponseData;
  updateServerDataState: (
    response: { [key: string]: unknown },
    authorisedOfficerId: number,
    signature: string,
    mode?: "store" | "update" | "destroy" | "generate"
  ) => void;
  fileState: ServerDataRequestProps;
  signatories?: SignatoryResponseData[];
  actions?: DocumentActionResponseData[];
  resolveAction: (
    action: DocumentActionResponseData,
    signatory?: SignatoryResponseData
  ) => void;
  activeSignatory?: SignatoryResponseData | null;
  signatures?: (SignatureResponseData | null | undefined)[] | null;
}

export interface PaperProps<T extends BaseResponse, D extends BaseRepository> {
  data: T;
  repo: D;
  template: FileTemplateResponseData | null;
  index: number;
  authorizedGroup: WorkflowStageGroupProps | null;
  currentStage: WorkflowStageResponseData | null;
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
  updateRaw,
  fill,
  updateServerDataState,
  fileState,
  draftTemplates,
  signatories,
  document,
}) => {
  const { resolveAction, activeSignatory, signatures } =
    useFileDeskRoutePipelines(
      resource,
      currentDraft,
      needsSignature,
      currentStage,
      fileState,
      currentTracker,
      nextTracker,
      updateRaw,
      signatories,
      drafts,
      document
    );

  // This filteredActions is to control button display
  const filteredActions = useMemo(() => {
    return (
      availableActions?.filter((action) => {
        const isInExcludedStatuses = [
          "appeal",
          "cancelled",
          "reversed",
        ].includes(action.action_status);
        const isPassedSignature =
          action.action_status === "passed" && action.category === "signature";

        const isComputed = action.resource_type === "computed";

        const isPaymentAction =
          action.is_payment === 1 &&
          action.is_resource === 1 &&
          action.has_update === 1 &&
          action.action_status === "passed";

        const isConsolidateAction =
          action.is_payment === 1 &&
          action.has_update === 1 &&
          action.resource_type === "private";

        const isDraftUpload =
          action.action_status === "stalled" && action.category === "upload";

        return (
          !isInExcludedStatuses &&
          !isPassedSignature &&
          !isDraftUpload &&
          !isPaymentAction &&
          !isComputed &&
          !isConsolidateAction
        );
      }) || []
    );
  }, [availableActions]);

  return (
    <>
      {/* Document Actions Section */}
      {filteredActions.length ? (
        <div className="document__actions__container">
          <div className="action__box flex align gap-sm">
            {filteredActions.map((action, i) => (
              <Button
                key={i}
                label={action.button_text}
                icon={action.icon}
                handleClick={() => resolveAction(action)}
                size="sm"
                variant={action.variant}
                isDisabled={action?.disabled ?? true}
              />
            ))}
          </div>
        </div>
      ) : (
        <p>No actions available</p>
      )}

      {draftTemplates?.length ? (
        draftTemplates.map(({ id, component: DraftTemplateComponent }) => (
          <Suspense key={id} fallback={<div>Loading...</div>}>
            <DraftTemplateComponent
              data={drafts.find((d) => d.id === id)?.draftable}
              draftId={id}
              template={drafts.find((d) => d.id === id)?.template}
              group={group}
              stage={currentStage}
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
              updateServerDataState={updateServerDataState}
              signatories={signatories}
              actions={availableActions}
              resolveAction={resolveAction}
              activeSignatory={activeSignatory}
              signatures={signatures}
              document={document}
            />
          </Suspense>
        ))
      ) : (
        <p>No draft templates available</p>
      )}
    </>
  );
};

export default FilePagesTab;
