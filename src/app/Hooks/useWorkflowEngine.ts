import { AuthUserResponseData } from "app/Context/AuthContext";
import {
  BaseRepository,
  BaseResponse,
  JsonResponse,
  TabOptionProps,
} from "app/Repositories/BaseRepository";
import {
  DocumentResponseData,
  UploadResponseData,
} from "app/Repositories/Document/data";
import { DocumentActionResponseData } from "app/Repositories/DocumentAction/data";
import { DocumentDraftResponseData } from "app/Repositories/DocumentDraft/data";
import { DocumentTypeResponseData } from "app/Repositories/DocumentType/data";
import { GroupResponseData } from "app/Repositories/Group/data";
import { ProgressTrackerResponseData } from "app/Repositories/ProgressTracker/data";
import { WorkflowResponseData } from "app/Repositories/Workflow/data";
import { WorkflowStageResponseData } from "app/Repositories/WorkflowStage/data";
import React, {
  lazy,
  LazyExoticComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import useWorkflow from "./useWorkflow";
import { SignatoryResponseData } from "app/Repositories/Signatory/data";
import { WidgetResponseData } from "app/Repositories/Widget/data";

export type ServerStateRequestProps = {
  resource_id: number;
  user_id: number;
  mode: "store" | "update" | "destroy" | "generate";
  data: {
    [key: string]: unknown;
  };
};

export type ServerDataRequestProps = {
  id: number;
  workflow_id: number;
  document_id: number;
  last_draft_id?: number;
  document_action_id: number;
  progress_tracker_id: number;
  service: string;
  message: string;
  signature?: string;
  amount?: string;
  taxable_amount?: string;
  authorising_staff_id: number;
  serverState: ServerStateRequestProps;
  component: string;
};

export type DraftTemplate = {
  id: number;
  component: LazyExoticComponent<React.ComponentType<any>>;
};

export type DocketDataType<
  T extends BaseResponse = BaseResponse,
  D extends BaseRepository = BaseRepository
> = {
  workflow: WorkflowResponseData | undefined;
  currentTracker: ProgressTrackerResponseData | undefined;
  drafts: DocumentDraftResponseData[];
  currentDraft: DocumentDraftResponseData;
  hasAccessToOperate: boolean;
  availableActions: DocumentActionResponseData[];
  nextTracker: ProgressTrackerResponseData;
  needsSignature: boolean;
  docType: DocumentTypeResponseData | undefined;
  uploads: UploadResponseData[] | undefined;
  group: GroupResponseData | undefined;
  currentStage: WorkflowStageResponseData | undefined;
  resource: T;
  index: number;
  updateRaw?: (data: JsonResponse) => void;
  handleUpdateRaw: (data: JsonResponse) => void;
  tab: TabOptionProps;
  document: DocumentResponseData;
  Repo: D;
  fill: (data: ServerDataRequestProps) => void;
  updateServerDataState: (
    response: { [key: string]: unknown },
    authorisedOfficerId: number,
    signature: string,
    mode?: "store" | "update" | "destroy" | "generate"
  ) => void;
  fileState: ServerDataRequestProps;
  setFileState: (data: ServerDataRequestProps) => void;
  draftTemplates: DraftTemplate[] | undefined;
  widgets: WidgetResponseData[];
  signatories?: SignatoryResponseData[];
  draftUploads?: UploadResponseData[];
  widgetComponents: Record<string, React.LazyExoticComponent<React.FC<any>>>;
};

// Define a default generic type
const initialServerDataState: ServerDataRequestProps = {
  id: 0,
  workflow_id: 0,
  document_id: 0,
  last_draft_id: 0,
  document_action_id: 0,
  progress_tracker_id: 0,
  component: "",
  service: "",
  message: "",
  signature: "",
  amount: "",
  taxable_amount: "",
  authorising_staff_id: 0,
  serverState: {
    resource_id: 0,
    user_id: 0,
    mode: "store",
    data: {},
  },
};

export const useWorkflowEngine = (
  document: DocumentResponseData,
  loggedInStaff: AuthUserResponseData | undefined,
  refreshRaw?: (data: JsonResponse) => void
) => {
  const {
    workflow,
    currentTracker,
    drafts,
    group,
    stage,
    docType,
    uploads,
    signatories,
    draftUploads,
  } = useWorkflow(document);

  // Get Current Draft
  const currentDraft = useMemo(
    () =>
      drafts.length > 0
        ? drafts.reduce((max, draft) => (draft.id > max.id ? draft : max))
        : null,
    [drafts]
  );

  const widgets = useMemo(() => {
    if (!currentTracker || !Array.isArray(currentTracker.widgets)) return [];
    return currentTracker.widgets;
  }, [currentTracker]);

  const widgetComponents = useMemo(() => {
    const map: Record<string, React.LazyExoticComponent<React.FC<any>>> = {};

    widgets.forEach((widget) => {
      const componentName = widget.component.replace(/[^a-zA-Z0-9]/g, "");

      try {
        map[widget.component] = lazy(
          () =>
            import(`resources/views/crud/templates/widgets/${componentName}`)
        );
      } catch (e) {
        console.warn(`Widget ${componentName} failed to load.`);
      }
    });

    return map;
  }, [widgets]);

  const nextTracker =
    workflow?.trackers.find(
      (tracker) => currentTracker && tracker.order === currentTracker?.order + 1
    ) ?? null;

  const [fileState, setFileState] = useState<ServerDataRequestProps>(
    initialServerDataState
  );

  const fill = (data: ServerDataRequestProps) => {
    setFileState((prev) => ({ ...prev, ...data }));
  };

  const handleUpdateRaw = useCallback(
    (data: JsonResponse) => {
      if (!refreshRaw) return;

      refreshRaw(data);
    },
    [refreshRaw]
  );

  const updateServerDataState = (
    response: { [key: string]: unknown },
    authorisedOfficerId: number,
    signature: string,
    mode?: "store" | "update" | "destroy" | "generate"
  ) => {
    setFileState((prev) => ({
      ...prev,
      authorising_staff_id: authorisedOfficerId,
      signature: signature,
      serverState: {
        ...prev.serverState,
        mode: mode ?? "update",
        data: response,
      },
    }));
  };

  const needsSignature =
    Number(currentTracker?.stage?.append_signature) === 1 &&
    currentTracker &&
    currentTracker?.signatory_id > 0;
  const noSignatureFound = needsSignature && !fileState.signature;

  const resource = useMemo(() => {
    if (!document || !loggedInStaff) return null;
    return document.documentable;
  }, [document, loggedInStaff, fileState.signature]);

  const hasAccessToOperate = useMemo(() => {
    if (!currentTracker || !loggedInStaff || !currentDraft) {
      // console.log("🔴 Access Denied: No current tracker or logged-in staff.");
      return false;
    }

    const userGroups = loggedInStaff.groups.map((group) => group.id);
    const isUserInGroup = userGroups.includes(currentTracker?.group_id);
    const isUserInDepartment =
      loggedInStaff.department_id === currentDraft.department_id;

    let canOperate = isUserInGroup && isUserInDepartment;

    if (!canOperate) {
      // console.log(
      //   `🔴 Access Denied: User is not in required group or department.`
      // );
    }

    // If draft is "attention", only the document owner can respond
    if (
      currentDraft?.type === "attention" ||
      currentDraft?.status === "rejected"
    ) {
      // canOperate = loggedInStaff.id === document.owner?.id;
      canOperate = false;
      if (!canOperate) {
        // console.log(
        //   `🔴 Access Denied: Only the document owner (${document.owner?.id}) can respond.`
        // );
      }
    }

    // If the draft is already responded to, allow workflow to continue
    if (
      canOperate &&
      ["response", "paper"].includes(currentDraft?.type ?? "")
    ) {
      canOperate = true;
      // console.log("✅ Access Granted: Document has already been responded to.");
    }

    // console.log(
    //   `ℹ️ Final Access Decision: ${canOperate ? "GRANTED ✅" : "DENIED ❌"}`
    // );
    return canOperate;
  }, [
    currentTracker,
    loggedInStaff,
    currentDraft,
    document,
    fileState.signature,
  ]);

  // Actions Control Centre
  const availableActions = useMemo(() => {
    return (
      currentTracker?.loadedActions?.map((action) => ({
        ...action,
        disabled:
          !hasAccessToOperate ||
          (noSignatureFound && action.action_status === "passed") ||
          !["responded", "signature-request", "pending"].includes(
            currentDraft?.status ?? ""
          ),
      })) ?? []
    );
  }, [currentTracker, hasAccessToOperate, noSignatureFound]);

  const draftTemplates: DraftTemplate[] | undefined = useMemo(() => {
    return (
      drafts &&
      drafts.map((draft) => {
        const sanitizedComponent =
          draft?.template?.component.replace(/[^a-zA-Z0-9]/g, "") ||
          "FallbackComponent";
        return {
          id: draft.id,
          component: lazy(
            () =>
              import(
                `resources/views/crud/templates/drafts/${sanitizedComponent}`
              )
          ),
        };
      })
    );
  }, [drafts]);

  useEffect(() => {
    if (document) {
      setFileState((prev) => ({
        ...prev,
        workflow_id: document.workflow_id,
        document_id: document.id,
        last_draft_id: currentDraft?.id ?? 0,
        progress_tracker_id: currentTracker?.id ?? 0,
      }));
    }
  }, [document]);

  const docket = {
    workflow,
    currentTracker,
    drafts,
    currentDraft,
    hasAccessToOperate,
    availableActions,
    nextTracker,
    widgets,
    needsSignature,
    docType,
    group,
    currentStage: stage,
    uploads,
    resource,
    signatories,
    document,
    draftUploads,
    handleUpdateRaw,
    widgetComponents,
  };

  return { ...docket, fill, updateServerDataState, fileState, draftTemplates };
};
