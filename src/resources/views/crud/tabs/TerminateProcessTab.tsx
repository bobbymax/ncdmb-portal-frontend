import { useFileDeskRoutePipelines } from "app/Hooks/useFileDeskRoutePipelines";
import { DocketDataType } from "app/Hooks/useWorkflowEngine";
import { DocumentResponseData } from "app/Repositories/Document/data";
import DocumentRepository from "app/Repositories/Document/DocumentRepository";
import React, { useMemo } from "react";
import Button from "resources/views/components/forms/Button";

const TerminateProcessTab: React.FC<
  DocketDataType<DocumentResponseData, DocumentRepository>
> = ({
  currentDraft,
  currentTracker,
  nextTracker,
  drafts,
  group,
  currentStage,
  availableActions,
  resource,
  updateRaw,
  updateServerDataState,
  fileState,
  needsSignature,
  docType,
}) => {
  const { resolveAction } = useFileDeskRoutePipelines(
    resource,
    currentDraft,
    needsSignature,
    currentStage,
    fileState,
    currentTracker,
    nextTracker,
    updateRaw
  );

  const controlledActions = useMemo(
    () =>
      availableActions.filter(
        (action) =>
          action.action_status === "appeal" ||
          action.action_status === "cancelled"
      ) || [],
    [availableActions]
  );

  console.log(controlledActions);

  /**
   *
   * Recall Action
   * - Will rollback current tracker to previous
   * - Will delete the lastDraft if lastDraft is not firstDraft
   * - Will update document history table
   * - Will check if the document resource is same as the last draft resource
   * - (if resources are not same), Will delete resource file (if any) || if mode === "destroy"
   * - Update the new lastDraft status to pending
   * - Notify Distribution List of the new Current Tracker
   *
   *
   * Destroy Action
   * - Will delete the document, drafts, uploads, updates, delete all media files
   * - Will delete document resource file
   * - Will update document history
   * - Notify Document Owner
   *
   */

  return (
    <div className="bttn__settings__area">
      <div className="row">
        {controlledActions.length > 0 ? (
          controlledActions.map((action, i) => (
            <div key={i} className="col-md-6">
              <div className="action__bttn__item">
                <p>{action.description}</p>
                <Button
                  label={action.button_text}
                  handleClick={() => resolveAction(action)}
                  variant={action.variant}
                  isDisabled={action?.disabled}
                  size="xs"
                  icon={action.icon}
                />
              </div>
            </div>
          ))
        ) : (
          <p>You cannot perform any admin actions on this stage</p>
        )}
      </div>
    </div>
  );
};

export default TerminateProcessTab;
