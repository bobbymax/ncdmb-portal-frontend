import { useFileDeskRoutePipelines } from "app/Hooks/useFileDeskRoutePipelines";
import { DocketDataType } from "app/Hooks/useWorkflowEngine";
import { BaseResponse } from "app/Repositories/BaseRepository";
import { DocumentResponseData } from "app/Repositories/Document/data";
import DocumentRepository from "app/Repositories/Document/DocumentRepository";
import { DocumentActionResponseData } from "app/Repositories/DocumentAction/data";
import { DocumentTypeResponseData } from "app/Repositories/DocumentType/data";
import { ProgressTrackerResponseData } from "app/Repositories/ProgressTracker/data";
import { WidgetResponseData } from "app/Repositories/Widget/data";
import React, { lazy, Suspense, useMemo } from "react";
import Button from "resources/views/components/forms/Button";

export interface SidebarProps<T extends BaseResponse> {
  resource: T;
  widget: WidgetResponseData;
  tracker: ProgressTrackerResponseData;
  uploadCount: number;
  docType: DocumentTypeResponseData;
  document: DocumentResponseData;
  actions: DocumentActionResponseData[];
}

const AnalysisSidebar: React.FC<
  DocketDataType<DocumentResponseData, DocumentRepository>
> = ({
  resource,
  drafts,
  currentTracker,
  currentDraft,
  needsSignature,
  currentStage,
  fileState,
  nextTracker,
  updateRaw,
  docType,
  uploads,
  document,
  availableActions,
  signatories,
}) => {
  const { resolveAction } = useFileDeskRoutePipelines(
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
  const widgets = useMemo(() => {
    if (!docType || !Array.isArray(docType.widgets)) return [];
    return docType.widgets;
  }, [docType]);

  const action: DocumentActionResponseData = useMemo(() => {
    if (!availableActions || !Array.isArray(availableActions))
      return {} as DocumentActionResponseData;

    return (
      availableActions.find(
        (action) =>
          action.action_status === "stalled" && action.category === "upload"
      ) ?? ({} as DocumentActionResponseData)
    );
  }, [availableActions]);

  // Map of widget.component => lazy-loaded component
  const widgetComponents = useMemo(() => {
    const map: Record<string, React.LazyExoticComponent<React.FC<any>>> = {};

    widgets.forEach((widget) => {
      const componentName = widget.component.replace(/[^a-zA-Z0-9]/g, "");

      try {
        map[widget.component] = lazy(
          () => import(`../widgets/${componentName}`)
        );
      } catch (e) {
        console.warn(`Widget ${componentName} failed to load.`);
      }
    });

    return map;
  }, [widgets]);

  return (
    <div>
      <div
        className="widget widget__action"
        style={{
          marginBottom: 42,
        }}
      >
        <p className="description">{action.description}</p>
        <Button
          label={action.button_text}
          handleClick={() => resolveAction(action)}
          isDisabled={currentDraft && currentDraft?.upload !== null}
          variant={action.variant}
          icon={action.icon}
          size="sm"
        />
      </div>
      {widgets.length > 0 ? (
        widgets.map((widget) => {
          const WidgetComponent = widgetComponents[widget.component];

          if (!WidgetComponent) {
            return (
              <div key={widget.id}>
                <small className="text-danger">
                  Unknown widget: {widget.component}
                </small>
              </div>
            );
          }

          return (
            <Suspense
              fallback={<div>Loading {widget.title}...</div>}
              key={widget.id}
            >
              <WidgetComponent
                widget={widget}
                resource={resource}
                tracker={currentTracker}
                uploadsCount={uploads?.length}
                docType={docType}
                document={document}
                actions={availableActions}
              />
            </Suspense>
          );
        })
      ) : (
        <p>No widgets to display</p>
      )}
    </div>
  );
};

export default AnalysisSidebar;
