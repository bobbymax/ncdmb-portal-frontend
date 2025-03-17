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
import ProgressTrackerRepository from "app/Repositories/ProgressTracker/ProgressTrackerRepository";
import { WorkflowResponseData } from "app/Repositories/Workflow/data";
import { WorkflowStageResponseData } from "app/Repositories/WorkflowStage/data";
import React, {
  lazy,
  LazyExoticComponent,
  useEffect,
  useMemo,
  useState,
} from "react";

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

type DraftTemplate = {
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
  loggedInStaff: AuthUserResponseData | undefined
) => {
  const ProgressTrackerRepo = useMemo(
    () => new ProgressTrackerRepository(),
    []
  );
  const [fileState, setFileState] = useState<ServerDataRequestProps>(
    initialServerDataState
  );

  const fill = (data: ServerDataRequestProps) => {
    setFileState((prev) => ({ ...prev, ...data }));
  };

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

  const docket = useMemo(() => {
    if (!document || !loggedInStaff) return null;

    // Get Workflow
    const workflow = document.workflow;
    const docType = document.document_type;
    const uploads = document.uploads ?? [];

    const tracker = workflow?.trackers.find(
      (tracker) => tracker.id === document.progress_tracker_id
    );

    // Get Current Tracker
    const currentTracker = ProgressTrackerRepo.fromJson(
      tracker as JsonResponse
    );

    // Get Drafts
    const drafts = document.drafts;
    const currentStage = currentTracker.stage;
    const group = currentTracker.group;

    // Get Current Draft
    const currentDraft =
      drafts.length > 0
        ? drafts.reduce((max, draft) => (draft.id > max.id ? draft : max))
        : null;

    // The Module from the Backend e.g. Claims, SubBudgetHeads etc.
    const resource = document.documentable;

    // Get Groups (loggedin staff)
    const userGroups = loggedInStaff.groups.map((group) => group.id);
    // Determine if the User has Access to Operate (Base Condition)
    let hasAccessToOperate = userGroups.includes(currentTracker?.group_id ?? 0);

    // Check If Logged-in User’s Groups are Not in Current Tracker Groups → Disable All Actions
    if (!userGroups.includes(currentTracker?.group_id ?? 0)) {
      hasAccessToOperate = false;
    }

    // Check if this stage needs a signature
    const needsSignature =
      Number(currentTracker?.stage?.append_signature) === 1;

    const noSignatureFound = needsSignature && !fileState.signature;

    // Check If Signature is Required and Not Provided → Disable "passed" Actions
    // if (noSignatureFound) {
    //   hasAccessToOperate = false;
    // }

    // Check If Last Draft Type is "attention" → Disable "passed" Actions
    const lastDraftStatus = currentDraft?.type;
    if (lastDraftStatus === "attention") {
      hasAccessToOperate = false;
    }

    // Check If Last Draft Department ID !== Logged-in User Department ID → Disable All Actions
    if (
      currentDraft &&
      currentDraft.department_id !== loggedInStaff.department_id
    ) {
      hasAccessToOperate = false;
    }

    // Check Permissions for User (Optional: If extra permission-based logic is needed)
    // Get Available Actions (Disable Certain Actions Based on Above Logic)
    const availableActions =
      currentTracker?.loadedActions?.map((action) => ({
        ...action,
        disabled:
          !hasAccessToOperate ||
          (noSignatureFound && action.action_status === "passed"),
      })) ?? [];

    // Get Next Tracker
    const nextTracker =
      workflow?.trackers.find(
        (tracker) =>
          currentTracker && tracker.order === currentTracker?.order + 1
      ) ?? null;

    return {
      workflow,
      currentTracker,
      drafts,
      currentDraft,
      hasAccessToOperate,
      availableActions,
      nextTracker,
      needsSignature,
      docType,
      group,
      currentStage,
      uploads,
      resource,
    } as Partial<DocketDataType<BaseResponse, BaseRepository>>;
  }, [document, loggedInStaff, fileState.signature]);

  const draftTemplates: DraftTemplate[] | undefined = useMemo(() => {
    return (
      docket?.drafts &&
      docket?.drafts.map((draft) => {
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
  }, [docket?.drafts]);

  useEffect(() => {
    if (document && docket) {
      setFileState((prev) => ({
        ...prev,
        workflow_id: document.workflow_id,
        document_id: document.id,
        last_draft_id: docket.currentDraft?.id ?? 0,
        progress_tracker_id: docket.currentTracker?.id ?? 0,
      }));
    }
  }, [document, docket]);

  return { ...docket, fill, updateServerDataState, fileState, draftTemplates };
};
