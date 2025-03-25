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
  currentStage,
  availableActions,
  resource,
  updateRaw,
  fileState,
  needsSignature,
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
          action.action_status === "cancelled" ||
          action.action_status === "reversed"
      ) || [],
    [availableActions]
  );

  return (
    <div className="bttn__settings__area">
      <div className="row">
        {controlledActions.length > 0 ? (
          controlledActions.map((action, i) => (
            <div key={i} className="col-md-6">
              <div className="action__bttn__item">
                <p className={action.variant}>{action.description}</p>
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
