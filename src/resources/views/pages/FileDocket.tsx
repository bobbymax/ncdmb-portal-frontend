import { lazy, Suspense, useCallback, useMemo, useState } from "react";
import { useResourceActions } from "app/Hooks/useResourceActions";
import {
  BaseRepository,
  TabOptionProps,
} from "app/Repositories/BaseRepository";
import { DocumentResponseData } from "app/Repositories/Document/data";
import { PageProps } from "bootstrap";
import { useAuth } from "app/Context/AuthContext";
import { useWorkflowEngine } from "app/Hooks/useWorkflowEngine";
import { accessibleTabs } from "app/Support/Helpers";
import TabActionButtonComponent from "../components/pages/TabActionButtonComponent";
import FileDocketHeader from "../components/pages/FileDocketHeader";

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
    draftTemplates,
  } = useWorkflowEngine(document, staff);

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
          <div className="desk__office custom-card mb-3">
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
                />
              </Suspense>
            </div>
          </div>
        </div>
        <div className="col-md-3"></div>
      </div>
    </div>
  );
};

FileDocket.displayName = "FileDocket";
export default FileDocket;
