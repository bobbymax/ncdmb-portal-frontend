import { BaseRepository } from "app/Repositories/BaseRepository";
import { DocumentResponseData } from "app/Repositories/Document/data";
import DocumentRepository from "app/Repositories/Document/DocumentRepository";
import { FileTemplateResponseData } from "app/Repositories/FileTemplate/data";
import {
  WorkflowStageGroupProps,
  WorkflowStageResponseData,
} from "app/Repositories/WorkflowStage/data";
import React, { lazy, Suspense, useCallback, useEffect, useState } from "react";
import LetterHeadedPaper from "resources/views/components/documents/LetterHeadedPaper";
import Button from "resources/views/components/forms/Button";
import { FileDocketStateProps } from "resources/views/pages/FileDocket";

export type DraftCardProps = {
  resource_id: number;
  user_id: number;
  draftable_id: number;
  [key: string]: unknown;
};

export type TabModelProps = {
  workflow_id?: number;
  document_id?: number;
  draft_id: number;
  service: string;
  isSigned?: boolean;
  signature?: string;
  state: DraftCardProps;
};

export interface DraftPageProps<T = TabModelProps> {
  data: unknown;
  template: FileTemplateResponseData | null;
  index: number;
  group: WorkflowStageGroupProps | null;
  stage: WorkflowStageResponseData | null;
  draftId: number;
  updateLocalState: (localState: T) => void;
}

const renderDraftTemplate = (props: DraftPageProps): JSX.Element => {
  const { index, template, ...rest } = props;

  const sanitizedComponent =
    template?.component.replace(/[^a-zA-Z0-9]/g, "") || "FallbackComponent";

  try {
    const DraftTemplateComponent = lazy(
      () => import(`../templates/${sanitizedComponent}`)
    );

    return (
      <Suspense fallback={<div>Loading...</div>}>
        <DraftTemplateComponent key={index} {...rest} />
      </Suspense>
    );
  } catch (error) {
    console.error(`Error loading component: ${sanitizedComponent}`, error);
    return <div>Error loading component: {sanitizedComponent}</div>;
  }
};

const FilePagesTab: React.FC<
  FileDocketStateProps<DocumentResponseData, DocumentRepository>
> = ({
  model,
  actions,
  drafts,
  stage,
  group,
  currentTracker,
  Repo,
  workflow,
}) => {
  const [tabState, setTabState] = useState<TabModelProps>({
    workflow_id: 0,
    document_id: 0,
    draft_id: 0,
    service: "",
    isSigned: false,
    signature: "",
    state: {
      resource_id: 0,
      user_id: 0,
      draftable_id: 0,
    },
  } as TabModelProps);

  // console.log(tabState);

  const updateLocalState = (localState: TabModelProps) => {
    setTabState((prev) => ({
      ...prev,
      ...localState,
    }));
  };

  const onDraftUpdate = useCallback(
    async (document_action_id: number, message?: string) => {
      const body = {
        document_action_id,
        message,
        progress_tracker_id: currentTracker?.id,
        ...tabState,
      };

      try {
        const response = await Repo.update(
          "service-workers",
          tabState.service,
          body
        );
        console.log(response);
      } catch (error) {
        console.log(error);
      }
    },
    [tabState]
  );

  useEffect(() => {
    if (workflow) {
      setTabState((prev) => ({
        ...prev,
        workflow_id: workflow.id,
        document_id: model.id,
      }));
    }
  }, [workflow, model]);

  return (
    <>
      {/* Document Actions Section */}
      <div className="document__actions__container">
        <div className="action__box flex align gap-sm">
          {actions.map((action, i) => (
            <Button
              key={i}
              label={action.button_text}
              icon={action.icon}
              handleClick={() => onDraftUpdate(action.id)}
              size="sm"
              variant={action.variant}
              isDisabled={
                action.action_status === "passed" && !tabState.isSigned
              }
            />
          ))}
        </div>
      </div>
      {Array.isArray(drafts) &&
        drafts.map((draft, index) => (
          <div key={index}>
            {renderDraftTemplate({
              data: draft.draftable,
              draftId: draft.id,
              index,
              template: draft?.template,
              group,
              stage,
              updateLocalState,
            })}
          </div>
        ))}
    </>
  );
};

export default FilePagesTab;
