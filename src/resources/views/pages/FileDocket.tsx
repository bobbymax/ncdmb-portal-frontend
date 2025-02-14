import { useResourceActions } from "app/Hooks/useResourceActions";
import {
  BaseRepository,
  JsonResponse,
  TabOptionProps,
} from "app/Repositories/BaseRepository";
import {
  DocumentResponseData,
  UploadResponseData,
} from "app/Repositories/Document/data";
import { PageProps } from "bootstrap";
import React, { lazy, Suspense, useCallback, useMemo, useState } from "react";
import Button from "../components/forms/Button";
import useWorkflow from "app/Hooks/useWorkflow";
import { TabAction } from "./ViewResourcePage";
import { WorkflowResponseData } from "app/Repositories/Workflow/data";
import { DocumentActionResponseData } from "app/Repositories/DocumentAction/data";
import { ProgressTrackerResponseData } from "app/Repositories/ProgressTracker/data";
import { DocumentDraftResponseData } from "app/Repositories/DocumentDraft/data";
import {
  WorkflowStageGroupProps,
  WorkflowStageResponseData,
} from "app/Repositories/WorkflowStage/data";
import { DocumentTypeResponseData } from "app/Repositories/DocumentType/data";
import Alert from "app/Support/Alert";
import { toast } from "react-toastify";

export interface FileDocketStateProps<T = JsonResponse, D = BaseRepository> {
  Repo: D;
  model: T;
  tab: TabOptionProps;
  workflow: WorkflowResponseData | null;
  actions: DocumentActionResponseData[];
  currentTracker: ProgressTrackerResponseData | null;
  drafts: DocumentDraftResponseData[];
  group: WorkflowStageGroupProps | null;
  docType: DocumentTypeResponseData | null;
  stage: WorkflowStageResponseData | null;
  uploads: UploadResponseData[];
  component: string;
  index: number;
}

const accessibleTabs: TabOptionProps[] = [
  {
    title: "Pages",
    label: "pages",
    component: "FilePagesTab",
    icon: "ri-file-copy-2-line",
    variant: "success",
    endpoint: "serviceWorkers",
    hasFile: false,
    appendSignature: true,
    isDefault: true,
    status: "draft",
  },
  {
    title: "Supporting Documents",
    label: "supporting-documents",
    component: "MediaFilesTab",
    icon: "ri-folder-line",
    variant: "dark",
    endpoint: "serviceWorkers",
    hasFile: false,
    appendSignature: true,
    isDefault: false,
    status: "draft",
  },
  {
    title: "Updates",
    label: "updates",
    component: "FileUpdateTab",
    icon: "ri-booklet-line",
    variant: "info",
    endpoint: "serviceWorkers",
    hasFile: false,
    appendSignature: false,
    isDefault: false,
    status: "draft",
  },
  {
    title: "Terminate Process",
    label: "terminate",
    component: "TerminateProcessTab",
    icon: "ri-file-shred-line",
    variant: "danger",
    endpoint: "serviceWorkers",
    hasFile: false,
    appendSignature: false,
    isDefault: false,
    status: "draft",
  },
];

const Tab = React.memo(({ action, toggleTab, isActive = false }: TabAction) => {
  const { variant, label, icon, title } = action;

  return (
    <li
      className={`tab-navigation-item ${variant} ${isActive ? "active" : ""}`}
      onClick={() => toggleTab(label)}
    >
      <i className={icon} />
      <p>{title}</p>
    </li>
  );
});

Tab.displayName = "Tab";

const renderFileTab = <T, D>(
  props: FileDocketStateProps<T, D>
): JSX.Element => {
  const { component, index, ...controlProps } = props;

  const FileDocketTabs = useMemo(() => {
    const sanitizedComponent =
      component.replace(/[^a-zA-Z0-9]/g, "") || "FallbackComponent";

    return lazy(() =>
      import(`../crud/tabs/${sanitizedComponent}`).catch((error) => {
        console.error(`Error loading component: ${sanitizedComponent}`, error);
        return { default: () => <div>Error loading component</div> };
      })
    );
  }, [component]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FileDocketTabs key={component} {...controlProps} />
    </Suspense>
  );
};

const FileDocket = ({ Repository, view }: PageProps<BaseRepository>) => {
  const { raw, redirectTo, back } = useResourceActions(Repository, view, {
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
    drafts,
    group,
    stage,
    actions,
    docType,
    uploads,
  } = useWorkflow(document);

  const handleDocumentActions = ({
    actionId,
    currentTrackerId,
  }: {
    actionId: number;
    currentTrackerId: number;
  }) => {
    const body = {};

    const serverData = Repository.prepareServerData(body);

    Alert.flash(
      "Update Document",
      "info",
      "To be clear, you are updating this document!"
    ).then(async (result) => {
      if (result.isConfirmed) {
        try {
          console.log(body);
          toast.success("Record deleted successfully!");
        } catch (er) {
          if (er instanceof Error) {
            toast.error(er.message);
          } else {
            toast.error("Failed to delete the record.");
          }
        }
      } else if (result.isDismissed) {
        toast.info("Action Cancelled.");
      }
    });
  };

  const handleTabToggle = useCallback((value: string) => {
    setActiveTab((prev) => (prev !== value ? value : prev));
  }, []);

  return (
    <div className="docket__container">
      <div className="row">
        <div className="col-md-12 mb-3">
          <div className="custom-card docket__header">
            <div className="actions__container flex align end gap-md">
              <Button
                label="Go Back"
                variant="danger"
                rounded
                handleClick={back}
                icon="ri-arrow-left-line"
                size="md"
              />
            </div>
          </div>
        </div>
        <div className="col-md-12 mb-4">
          <div className="document__analysis flex align start gap-xxl">
            <div className="document__title">
              <small>{document?.ref}</small>
              <h1>{document?.title}</h1>
            </div>

            <div className="document__type">{docType?.name}</div>
          </div>
        </div>
        <div className="col-md-9">
          <div className="desk__office custom-card mb-3">
            <nav className="tab-navigation mb-4">
              <ul>
                {accessibleTabs.map((action) => (
                  <Tab
                    key={action.label}
                    action={action}
                    toggleTab={handleTabToggle}
                    isActive={activeTab === action.label}
                  />
                ))}
              </ul>
            </nav>

            {/* Fiel Tab Content */}
            <div className="file__tab__content mt-3">
              {activeActionComponent &&
                renderFileTab({
                  Repo: Repository,
                  model: document,
                  tab: activeActionComponent,
                  workflow,
                  actions,
                  currentTracker,
                  drafts,
                  group,
                  docType,
                  stage,
                  component: activeActionComponent.component,
                  uploads,
                  index: accessibleTabs.indexOf(activeActionComponent),
                })}
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
