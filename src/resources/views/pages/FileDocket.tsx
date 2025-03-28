import { lazy, Suspense, useCallback, useMemo, useState } from "react";
import { useResourceActions } from "app/Hooks/useResourceActions";
import {
  BaseRepository,
  BaseResponse,
  TabOptionProps,
} from "app/Repositories/BaseRepository";
import {
  DocumentResponseData,
  UploadResponseData,
} from "app/Repositories/Document/data";
import { PageProps } from "bootstrap";
import { useAuth } from "app/Context/AuthContext";
import { useWorkflowEngine } from "app/Hooks/useWorkflowEngine";
import { accessibleTabs } from "app/Support/Helpers";
import TabActionButtonComponent from "../components/pages/TabActionButtonComponent";
import FileDocketHeader from "../components/pages/FileDocketHeader";
import { DocumentDraftResponseData } from "app/Repositories/DocumentDraft/data";
import { ProgressTrackerResponseData } from "app/Repositories/ProgressTracker/data";
import { WorkflowResponseData } from "app/Repositories/Workflow/data";
import { DocumentTypeResponseData } from "app/Repositories/DocumentType/data";
import { DocumentActionResponseData } from "app/Repositories/DocumentAction/data";

export interface DocketSidebarProps<T extends BaseResponse> {
  // resource, drafts, currentDraft, tracker, widget
  resource: T;
  drafts: DocumentDraftResponseData[];
  tracker: ProgressTrackerResponseData;
  workflow: WorkflowResponseData;
  tab: TabOptionProps;
  docType: DocumentTypeResponseData;
  document: DocumentResponseData;
  uploads: UploadResponseData[];
  availableActions: DocumentActionResponseData[];
}

const FileDocket = ({ Repository, view }: PageProps<BaseRepository>) => {
  const { staff } = useAuth();
  const { raw, refreshRaw, back } = useResourceActions(Repository, view, {
    shouldFetch: false,
    hasParam: true,
  });

  const document = useMemo(() => raw as DocumentResponseData, [raw]);
  const [activeTab, setActiveTab] = useState<string>("pages");
  const activeActionComponent = useMemo(
    () => accessibleTabs.find((tab) => tab.label === activeTab),
    [activeTab]
  );

  const {
    workflow,
    currentTracker,
    currentDraft,
    drafts,
    group,
    currentStage,
    availableActions,
    hasAccessToOperate,
    docType,
    uploads,
    resource,
    nextTracker,
    needsSignature,
    fileState,
    fill,
    updateServerDataState,
    draftTemplates,
    signatories,
    draftUploads,
    handleUpdateRaw,
  } = useWorkflowEngine(document, staff, refreshRaw);

  const handleTabToggle = useCallback(
    (value: string) => setActiveTab((prev) => (prev !== value ? value : prev)),
    []
  );

  // 📌 Load Dynamic Component
  const DynamicComponent = useMemo(() => {
    if (!activeActionComponent) return () => <div>No component available</div>;

    const sanitizedComponent =
      activeActionComponent.component.replace(/[^a-zA-Z0-9]/g, "") ||
      "FallbackComponent";
    return lazy(() =>
      import(`../crud/tabs/${sanitizedComponent}`).catch(() => ({
        default: () => <div>Error loading component</div>,
      }))
    );
  }, [activeActionComponent]);

  const DynamicSidebarComponent = useMemo(() => {
    if (!activeActionComponent) return () => <div>No component available</div>;

    const sanitizedComponent =
      activeActionComponent.sidebar.replace(/[^a-zA-Z0-9]/g, "") ||
      "FallbackComponent";

    return lazy(() =>
      import(`../crud/templates/sidebars/${sanitizedComponent}`).catch(() => ({
        default: () => <div>Error loading component</div>,
      }))
    );
  }, [activeActionComponent]);

  return (
    <div className="docket__container">
      {/* Desk Header */}
      <FileDocketHeader
        title={document?.title}
        reference={document?.ref}
        document_type={docType?.name ?? ""}
        back={back}
      />

      {/* Desk Board */}
      <div className="row">
        <div className="col-md-8">
          <div className="desk__office custom-card file__card mb-3">
            <TabActionButtonComponent
              tabs={accessibleTabs}
              handleTabToggle={handleTabToggle}
              activeTab={activeTab}
            />

            {/* Draft Templates */}
            <div className="file__tab__content mt-3">
              <Suspense fallback={<div>Loading...</div>}>
                <DynamicComponent
                  Repo={Repository}
                  resource={resource}
                  tab={activeActionComponent}
                  currentDraft={currentDraft}
                  hasAccessToOperate={hasAccessToOperate}
                  nextTracker={nextTracker}
                  needsSignature={needsSignature}
                  workflow={workflow}
                  availableActions={availableActions}
                  currentTracker={currentTracker}
                  drafts={drafts}
                  group={group}
                  docType={docType}
                  currentStage={currentStage}
                  component={activeActionComponent?.component}
                  uploads={uploads}
                  index={accessibleTabs.indexOf(
                    activeActionComponent as TabOptionProps
                  )}
                  updateRaw={refreshRaw}
                  document={document}
                  fill={fill}
                  fileState={fileState}
                  draftTemplates={draftTemplates}
                  updateServerDataState={updateServerDataState}
                  signatories={signatories}
                  draftUploads={draftUploads}
                  handleUpdateRaw={handleUpdateRaw}
                />
              </Suspense>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="custom-card file__card desk__office">
            <Suspense fallback={<div>Loading...</div>}>
              <DynamicSidebarComponent
                Repo={Repository}
                resource={resource}
                tab={activeActionComponent}
                currentDraft={currentDraft}
                hasAccessToOperate={hasAccessToOperate}
                nextTracker={nextTracker}
                needsSignature={needsSignature}
                workflow={workflow}
                availableActions={availableActions}
                currentTracker={currentTracker}
                drafts={drafts}
                group={group}
                docType={docType}
                currentStage={currentStage}
                component={activeActionComponent?.component}
                uploads={uploads}
                index={accessibleTabs.indexOf(
                  activeActionComponent as TabOptionProps
                )}
                updateRaw={refreshRaw}
                document={document}
                fill={fill}
                fileState={fileState}
                draftTemplates={draftTemplates}
                updateServerDataState={updateServerDataState}
                signatories={signatories}
                draftUploads={draftUploads}
                handleUpdateRaw={handleUpdateRaw}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
};

FileDocket.displayName = "FileDocket";
export default FileDocket;
