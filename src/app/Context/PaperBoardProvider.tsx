import {
  AccessLevelProps,
  DocumentActivity,
  DocumentRequirementProps,
  PaperBoardContext,
  PaperBoardContextType,
  PaperBoardState,
} from "./PaperBoardContext";
// ResourceContext import removed - resources no longer managed here
import {
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useCallback,
  useState,
} from "react";
import { paperBoardReducer } from "./PaperBoardReducer";
import { AuthUserResponseData } from "./AuthContext";
import { useParams } from "react-router-dom";
import useDocumentGenerator from "../Hooks/useDocumentGenerator";
import { ContentBlock } from "@/resources/views/crud/DocumentTemplateBuilder";
import {
  DeskComponentPropTypes,
  SheetProps,
} from "@/resources/views/pages/DocumentTemplateContent";
import { TemplateResponseData } from "../Repositories/Template/data";
import { WorkflowResponseData } from "../Repositories/Workflow/data";
import { BlockResponseData } from "../Repositories/Block/data";
import { BaseResponse } from "../Repositories/BaseRepository";
import { DataOptionsProps } from "@/resources/views/components/forms/MultiSelect";
import { DocumentResponseData } from "../Repositories/Document/data";
import {
  DocumentCategoryResponseData,
  DocumentMetaDataProps,
} from "../Repositories/DocumentCategory/data";
import { ThreadResponseData } from "../Repositories/Thread/data";
import { ProgressTrackerResponseData } from "../Repositories/ProgressTracker/data";
import { ProcessFlowConfigProps } from "@/resources/views/crud/DocumentWorkflow";
import {
  CategoryWorkflowProps,
  CategoryProgressTrackerProps,
} from "../Repositories/DocumentCategory/data";
import {
  SettingsProps,
  WatcherProps,
} from "@/resources/views/components/DocumentGeneratorTab/SettingsGeneratorTab";
import { repo } from "bootstrap/repositories";
import { useRequestManager } from "./RequestManagerContext";

export const PaperBoardProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { addRequest } = useRequestManager();
  const initialState: PaperBoardState = {
    isLoading: false,
    hasError: false,
    errorMessage: null,
    context: "builder",
    mode: "store",
    category: null,
    template: null,
    document_owner: null,
    department_owner: null,
    metaData: null,
    contents: [],
    body: [],
    resourceLinks: [],
    configState: {
      from: null,
      to: null,
      through: null,
    },
    blocks: [],
    activeBlockId: null,
    isBuilding: false,
    buildProgress: 0,
    buildStep: "",
    documentState: null,
    resource: null,
    contentState: {},
    isGenerating: false,
    workflow: null,
    trackers: [],
    uploads: [],
    fund: null,
    approval_memo: null,
    // resources removed - now managed by ResourceContext
    loggedInUser: undefined,
    preferences: {
      priority: "medium",
      accessLevel: "private",
      access_token: "",
      lock: false,
      confidentiality: "general",
    },
    watchers: [],
    requirements: [],
    threads: [],
    existingDocument: null,
    currentPointer: null,
    accessLevel: "looker",
    sync: false,
    documentActivities: [],
  };

  const [state, dispatch] = useReducer(paperBoardReducer, initialState);
  const params = useParams();
  const hasLoadedActivities = useRef(false);

  // Load activities from localStorage on mount (only once)
  useEffect(() => {
    if (!hasLoadedActivities.current) {
      const savedActivities = localStorage.getItem("documentActivities");
      if (savedActivities) {
        try {
          const activities = JSON.parse(savedActivities);
          if (Array.isArray(activities)) {
            // Dispatch each activity to add them to state
            activities.forEach((activity) => {
              dispatch({ type: "ADD_DOCUMENT_ACTIVITY", payload: activity });
            });
          }
        } catch (error) {
          // Error loading activities from localStorage
        }
      }
      hasLoadedActivities.current = true;
    }
  }, []);

  // Save activities to localStorage whenever activities change
  useEffect(() => {
    if (state.documentActivities.length > 0) {
      localStorage.setItem(
        "documentActivities",
        JSON.stringify(state.documentActivities)
      );
    }
  }, [state.documentActivities]);

  // Clear localStorage on component unmount to prevent stale data
  useEffect(() => {
    return () => {
      // Only clear if we're not in the middle of a session
      // This prevents clearing data when navigating between pages
    };
  }, []);

  // Initialize from URL params if available
  const {
    configState: urlConfigState,
    editedContents: urlEditedContents,
    category: urlCategory,
    template: urlTemplate,
    blocks: urlBlocks,
    workflow: urlWorkflow,
    trackers: urlTrackers,
    body: urlBody,
    isBuilding: urlIsBuilding,
    metaData: urlMetaData,
    // resources removed - now managed by ResourceContext
    loggedInUser: staff,
    requirements: urlRequirements,
    existingDocument,
  } = useDocumentGenerator(params);

  // Initialize state from URL params - use refs to prevent infinite loops
  const initializedRef = useRef({
    category: false,
    template: false,
    contents: false,
    configState: false,
    blocks: false,
    workflow: false,
    trackers: false,
    body: false,
    isBuilding: false,
    metaData: false,
    resources: false,
    loggedInUser: false,
    requirements: false,
    existingDocument: false,
  });

  useEffect(() => {
    if (
      urlConfigState &&
      Object.keys(urlConfigState).length > 0 &&
      !initializedRef.current.configState &&
      JSON.stringify(urlConfigState) !==
        JSON.stringify({
          from: null,
          to: null,
          through: null,
        })
    ) {
      initializedRef.current.configState = true;
      dispatch({ type: "SET_CONFIG_STATE", payload: urlConfigState });
    }

    if (urlCategory && !state.category && !initializedRef.current.category) {
      initializedRef.current.category = true;
      dispatch({ type: "SET_CATEGORY", payload: urlCategory });
    }

    if (urlTemplate && !state.template && !initializedRef.current.template) {
      initializedRef.current.template = true;
      dispatch({ type: "SET_TEMPLATE", payload: urlTemplate });
    }

    // Initialize blocks from category.blocks
    if (
      urlBlocks &&
      urlBlocks.length > 0 &&
      state.blocks.length === 0 &&
      !initializedRef.current.blocks
    ) {
      initializedRef.current.blocks = true;
      dispatch({ type: "SET_BLOCKS", payload: urlBlocks });
    }

    // Initialize workflow from category.workflow
    if (urlWorkflow && !state.workflow && !initializedRef.current.workflow) {
      initializedRef.current.workflow = true;
      dispatch({
        type: "SET_WORKFLOW",
        payload: {
          workflow: urlWorkflow,
          trackers: urlTrackers || [],
        },
      });
    }

    // Initialize body from category.content
    if (
      urlBody &&
      urlBody.length > 0 &&
      state.body.length === 0 &&
      !initializedRef.current.body
    ) {
      initializedRef.current.body = true;
      dispatch({ type: "SET_BODY", payload: urlBody });
    }

    // Initialize isBuilding
    if (urlIsBuilding && !initializedRef.current.isBuilding) {
      initializedRef.current.isBuilding = true;
      dispatch({ type: "SET_IS_BUILDING", payload: urlIsBuilding });
    }

    if (urlMetaData && !state.metaData && !initializedRef.current.metaData) {
      initializedRef.current.metaData = true;
      dispatch({ type: "SET_META_DATA", payload: urlMetaData });
    }

    // Resources initialization removed - now handled by ResourceContext

    if (
      urlEditedContents.length > 0 &&
      state.contents.length === 0 &&
      !initializedRef.current.contents
    ) {
      initializedRef.current.contents = true;
      const sheetProps: SheetProps[] = urlEditedContents.map(
        (content, index) =>
          ({
            id: content.id || `content-${index}`,
            order: index + 1,
            paper_title: content.content?.paper_title || {},
            title: content.content?.title || {},
            paragraph: content.content?.paragraph || {},
            expense: content.content?.expense || {},
            invoice: content.content?.invoice || {},
            requisition: content.content?.requisition || {},
            signature: content.content?.signature || {},
            text: content.content?.text || {},
            table: content.content?.table || {},
            list: content.content?.list || {},
            header: content.content?.header || {},
            event: content.content?.event || {},
          } as SheetProps)
      ) as SheetProps[];
      dispatch({ type: "REORDER_CONTENTS", payload: sheetProps });
    }

    if (staff && !state.loggedInUser && !initializedRef.current.loggedInUser) {
      initializedRef.current.loggedInUser = true;
      dispatch({ type: "SET_LOGGED_IN_USER", payload: staff });
    }

    if (
      urlRequirements &&
      urlRequirements.length > 0 &&
      !initializedRef.current.requirements
    ) {
      initializedRef.current.requirements = true;
      dispatch({ type: "SET_REQUIREMENTS", payload: urlRequirements });
    }

    if (existingDocument && !initializedRef.current.existingDocument) {
      initializedRef.current.existingDocument = true;
      dispatch({ type: "SET_EXISTING_DOCUMENT", payload: existingDocument });
    }
  }, [
    urlCategory,
    urlTemplate,
    urlEditedContents,
    urlConfigState,
    urlBlocks,
    urlWorkflow,
    urlTrackers,
    urlBody,
    urlIsBuilding,
    urlMetaData,
    state.category,
    state.template,
    state.contents,
    state.blocks,
    state.workflow,
    state.body,
    state.metaData,
    state.loggedInUser,
    staff,
    urlRequirements,
    existingDocument,
  ]);

  // Resources update effect removed - now handled by ResourceContext

  const actions = {
    setCategory: (category: DocumentCategoryResponseData | null) => {
      dispatch({ type: "SET_CATEGORY", payload: category });
    },
    setTemplate: (template: TemplateResponseData | null) => {
      dispatch({ type: "SET_TEMPLATE", payload: template });
    },
    setResourceLinks: (resourceLinks: ContentBlock[]) => {
      dispatch({ type: "SET_RESOURCE_LINKS", payload: resourceLinks });
    },
    addResourceLink: (resourceLink: ContentBlock) => {
      dispatch({ type: "ADD_RESOURCE_LINK", payload: resourceLink });
    },
    updateResourceLink: (resourceLink: ContentBlock) => {
      dispatch({ type: "UPDATE_RESOURCE_LINK", payload: resourceLink });
    },
    deleteResourceLink: (resourceLinkId: string) => {
      dispatch({ type: "DELETE_RESOURCE_LINK", payload: resourceLinkId });
    },
    addContent: (content: SheetProps) => {
      dispatch({ type: "ADD_CONTENT", payload: content });
    },
    addUpload: (upload: File) => {
      dispatch({ type: "ADD_UPLOAD", payload: upload });
    },
    updateContent: (content: SheetProps) => {
      dispatch({ type: "UPDATE_CONTENT", payload: content });
    },
    deleteContent: (blockId: string) => {
      dispatch({ type: "DELETE_CONTENT", payload: blockId });
    },
    setBody: (body: ContentBlock[]) => {
      dispatch({ type: "SET_BODY", payload: body });
    },
    setConfigState: (configState: ProcessFlowConfigProps | null) => {
      dispatch({ type: "SET_CONFIG_STATE", payload: configState });
    },
    updateConfigState: (configState: ProcessFlowConfigProps | null) => {
      dispatch({ type: "UPDATE_CONFIG_STATE", payload: configState });
    },
    setWorkflow: (
      workflow: WorkflowResponseData,
      trackers: ProgressTrackerResponseData[]
    ) => {
      // Convert to CategoryWorkflowProps and CategoryProgressTrackerProps
      const categoryWorkflow: CategoryWorkflowProps = {
        // Map the properties accordingly
        ...workflow,
      } as unknown as CategoryWorkflowProps;

      const categoryTrackers: CategoryProgressTrackerProps[] = trackers.map(
        (tracker) => ({
          // Map the properties accordingly
          ...tracker,
        })
      ) as unknown as CategoryProgressTrackerProps[];

      dispatch({
        type: "SET_WORKFLOW",
        payload: { workflow: categoryWorkflow, trackers: categoryTrackers },
      });
    },
    setBlocks: (blocks: BlockResponseData[]) => {
      dispatch({ type: "SET_BLOCKS", payload: blocks });
    },
    addBlock: (block: BlockResponseData) => {
      dispatch({ type: "ADD_BLOCK", payload: block });
    },
    deleteBlock: (blockId: string) => {
      dispatch({ type: "DELETE_BLOCK", payload: blockId });
    },
    updateBlock: (block: BlockResponseData) => {
      dispatch({ type: "UPDATE_BLOCK", payload: block });
    },
    setActiveBlockId: (blockId: string | null) => {
      dispatch({ type: "SET_ACTIVE_BLOCK_ID", payload: blockId });
    },
    setIsBuilding: (isBuilding: boolean) => {
      dispatch({ type: "SET_IS_BUILDING", payload: isBuilding });
    },
    setBuildProgress: (progress: number) => {
      dispatch({ type: "SET_BUILD_PROGRESS", payload: progress });
    },
    setDocumentState: (documentState: DocumentResponseData | null) => {
      dispatch({ type: "SET_DOCUMENT_STATE", payload: documentState });
    },
    setDepartmentOwner: (department: DataOptionsProps | null) => {
      dispatch({ type: "SET_DEPARTMENT_OWNER", payload: department });
    },
    updateDepartmentOwner: (department: DataOptionsProps | null) => {
      dispatch({ type: "UPDATE_DEPARTMENT_OWNER", payload: department });
    },
    setDocumentOwner: (document: DataOptionsProps | null) => {
      dispatch({ type: "SET_DOCUMENT_OWNER", payload: document });
    },
    updateDocumentOwner: (document: DataOptionsProps | null) => {
      dispatch({ type: "UPDATE_DOCUMENT_OWNER", payload: document });
    },
    setResource: (resource: BaseResponse | null) => {
      dispatch({ type: "SET_RESOURCE", payload: resource });
    },
    setUploads: (uploads: { id: string; file: File }[]) => {
      dispatch({ type: "SET_UPLOADS", payload: uploads });
    },
    removeUpload: (uploadId: string | number) => {
      dispatch({ type: "REMOVE_UPLOAD", payload: uploadId });
    },
    setFund: (fund: DataOptionsProps | null) => {
      dispatch({ type: "SET_FUND", payload: fund });
    },
    setApprovalMemo: (approvalMemo: DocumentResponseData | null) => {
      dispatch({ type: "SET_APPROVAL_MEMO", payload: approvalMemo });
    },
    setIsLoading: (loading: boolean) => {
      dispatch({ type: "SET_IS_LOADING", payload: loading });
    },
    updateBody: (body: ContentBlock, type: DeskComponentPropTypes) => {
      dispatch({ type: "UPDATE_BODY", payload: { body, type } });
    },
    setMetaData: (metaData: DocumentMetaDataProps | null) => {
      dispatch({ type: "SET_META_DATA", payload: metaData });
    },
    updateMetaData: (metaData: DocumentMetaDataProps | null) => {
      dispatch({ type: "UPDATE_META_DATA", payload: metaData });
    },
    // setResources removed - resources now managed by ResourceContext
    setLoggedInUser: (user: AuthUserResponseData | undefined) => {
      dispatch({ type: "SET_LOGGED_IN_USER", payload: user });
    },
    setPreferences: (preferences: SettingsProps) => {
      dispatch({ type: "SET_PREFERENCES", payload: preferences });
    },
    updatePreferences: (preferences: SettingsProps) => {
      dispatch({ type: "UPDATE_PREFERENCES", payload: preferences });
    },
    setWatchers: (watchers: WatcherProps[]) => {
      dispatch({ type: "SET_WATCHERS", payload: watchers });
    },
    setRequirements: (requirements: DocumentRequirementProps[]) => {
      dispatch({ type: "SET_REQUIREMENTS", payload: requirements });
    },
    updateRequirements: (requirements: DocumentRequirementProps) => {
      dispatch({ type: "UPDATE_REQUIREMENTS", payload: requirements });
    },
    setThreads: (threads: ThreadResponseData[]) => {
      dispatch({ type: "SET_THREADS", payload: threads });
    },
    updateThreads: (threads: ThreadResponseData) => {
      dispatch({ type: "UPDATE_THREADS", payload: threads });
    },
    setExistingDocument: (document: DocumentResponseData | null) => {
      dispatch({ type: "SET_EXISTING_DOCUMENT", payload: document });
    },
    setCurrentPointer: (pointer: string | null) => {
      dispatch({ type: "SET_CURRENT_POINTER", payload: pointer });
    },
    setAccessLevel: (accessLevel: AccessLevelProps) => {
      dispatch({ type: "SET_ACCESS_LEVEL", payload: accessLevel });
    },
    setContext: (context: "desk" | "generator") => {
      dispatch({ type: "SET_CONTEXT", payload: context });
    },
    setSync: (sync: boolean) => {
      dispatch({ type: "SET_SYNC", payload: sync });
    },
    addDocumentActivity: (activity: DocumentActivity) => {
      dispatch({ type: "ADD_DOCUMENT_ACTIVITY", payload: activity });
    },
    clearDocumentActivities: () => {
      dispatch({ type: "CLEAR_DOCUMENT_ACTIVITIES" });
      localStorage.removeItem("documentActivities");
    },
    setTrackers: (trackers: CategoryProgressTrackerProps[]) => {
      dispatch({ type: "SET_TRACKERS", payload: trackers });
    },

    // Resource management methods removed - use ResourceContext directly
  };

  // Resources are now managed by ResourceContext

  const contextValue: PaperBoardContextType = {
    state,
    actions,
  };

  return (
    <PaperBoardContext.Provider value={contextValue}>
      {children}
    </PaperBoardContext.Provider>
  );
};
