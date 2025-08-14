import { ProcessTabsOption } from "@/resources/views/crud/ContentBuilder";
import {
  PaperBoardContext,
  PaperBoardContextType,
  PaperBoardState,
} from "./PaperBoardContext";
import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { paperBoardReducer } from "./PaperBoardReducer";
import { useAuth } from "./AuthContext";
import { useParams } from "react-router-dom";
import useDocumentGenerator from "../Hooks/useDocumentGenerator";
import useWorkflowTransformer from "../Hooks/useWorkflowTransformer";
import { ContentAreaProps } from "../Hooks/useBuilder";
import { TemplateResponseData } from "../Repositories/Template/data";
import { ConfigState } from "../Hooks/useTemplateHeader";
import { WorkflowResponseData } from "../Repositories/Workflow/data";
import { BlockResponseData } from "../Repositories/Block/data";
import { BaseResponse } from "../Repositories/BaseRepository";
import { DataOptionsProps } from "@/resources/views/components/forms/MultiSelect";
import { DocumentResponseData } from "../Repositories/Document/data";
import { DocumentCategoryResponseData } from "../Repositories/DocumentCategory/data";
import { ProgressTrackerResponseData } from "../Repositories/ProgressTracker/data";

export const PaperBoardProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
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
    contents: [],
    body: [],
    configState: {
      from: {
        key: "from",
        state: {
          process_type: "from",
          stage: null,
          group: null,
          department: null,
          staff: null,
          is_approving: null,
          permissions: "rw",
        },
      },
      to: {
        key: "to",
        state: {
          process_type: "to",
          stage: null,
          group: null,
          department: null,
          staff: null,
          is_approving: null,
          permissions: "rw",
        },
      },
      through: {
        key: "through",
        state: {
          process_type: "through",
          stage: null,
          group: null,
          department: null,
          staff: null,
          is_approving: null,
          permissions: "rw",
        },
      },
      cc: { key: "cc", state: [] },
      approvers: { key: "approvers", state: [] },
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
    processType: {} as ProcessTabsOption,
    uploads: [],
    fund: null,
    approval_memo: null,
  };

  const [state, dispatch] = useReducer(paperBoardReducer, initialState);
  const { staff } = useAuth();
  const params = useParams();

  // Initialize from URL params if available
  const {
    configState: urlConfigState,
    editedContents: urlEditedContents,
    category: urlCategory,
    template: urlTemplate,
  } = useDocumentGenerator(params);

  // Transform workflow data from configState
  const workflowTransformerInput = useMemo(
    () => ({
      configState: state.configState,
      category: state.category,
    }),
    [state.configState, state.category]
  );

  const {
    workflow: transformedWorkflow,
    trackers: transformedTrackers,
    isValid: isWorkflowValid,
    errors: workflowErrors,
  } = useWorkflowTransformer(workflowTransformerInput);

  // Initialize state from URL params - use refs to prevent infinite loops
  const initializedRef = useRef({
    category: false,
    template: false,
    contents: false,
    configState: false,
  });

  useEffect(() => {
    if (urlCategory && !state.category && !initializedRef.current.category) {
      initializedRef.current.category = true;
      dispatch({ type: "SET_CATEGORY", payload: urlCategory });
    }
    if (urlTemplate && !state.template && !initializedRef.current.template) {
      initializedRef.current.template = true;
      dispatch({ type: "SET_TEMPLATE", payload: urlTemplate });
    }
    if (
      urlEditedContents.length > 0 &&
      state.contents.length === 0 &&
      !initializedRef.current.contents
    ) {
      initializedRef.current.contents = true;
      dispatch({ type: "REORDER_CONTENTS", payload: urlEditedContents });
    }
    if (
      urlConfigState &&
      Object.keys(urlConfigState).length > 0 &&
      !initializedRef.current.configState
    ) {
      // Only update once to prevent infinite loops
      initializedRef.current.configState = true;
      dispatch({ type: "UPDATE_CONFIG_STATE", payload: urlConfigState });
    }
  }, [
    urlCategory,
    urlTemplate,
    urlEditedContents,
    urlConfigState,
    state.category,
    state.template,
    state.contents,
  ]);

  // Update workflow when configState changes - use refs to prevent infinite loops
  const workflowInitializedRef = useRef(false);

  useEffect(() => {
    if (
      transformedWorkflow &&
      transformedTrackers &&
      !workflowInitializedRef.current
    ) {
      // Only update once to prevent infinite loops
      workflowInitializedRef.current = true;
      dispatch({
        type: "SET_WORKFLOW",
        payload: {
          workflow: transformedWorkflow,
          trackers: transformedTrackers,
        },
      });
    }
  }, [transformedWorkflow, transformedTrackers]);

  const actions = useMemo(
    () => ({
      setCategory: (category: DocumentCategoryResponseData | null) => {
        dispatch({ type: "SET_CATEGORY", payload: category });
      },
      setTemplate: (template: TemplateResponseData | null) => {
        dispatch({ type: "SET_TEMPLATE", payload: template });
      },
      addContent: (content: ContentAreaProps) => {
        dispatch({ type: "ADD_CONTENT", payload: content });
      },
      updateContent: (content: ContentAreaProps) => {
        dispatch({ type: "UPDATE_CONTENT", payload: content });
      },
      deleteContent: (blockId: string) => {
        dispatch({ type: "DELETE_CONTENT", payload: blockId });
      },
      setBody: (body: ContentAreaProps[]) => {
        dispatch({ type: "SET_BODY", payload: body });
      },
      setConfigState: (configState: ConfigState) => {
        dispatch({ type: "SET_CONFIG_STATE", payload: configState });
      },
      updateConfigState: (configState: ConfigState) => {
        dispatch({ type: "UPDATE_CONFIG_STATE", payload: configState });
      },
      setWorkflow: (
        workflow: WorkflowResponseData,
        trackers: ProgressTrackerResponseData[]
      ) => {
        dispatch({
          type: "SET_WORKFLOW",
          payload: { workflow, trackers },
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
      setResource: (resource: BaseResponse | null) => {
        dispatch({ type: "SET_RESOURCE", payload: resource });
      },
      setUploads: (uploads: { id: string; file: File }[]) => {
        dispatch({ type: "SET_UPLOADS", payload: uploads });
      },
      removeUpload: (uploadId: string) => {
        dispatch({ type: "REMOVE_UPLOAD", payload: uploadId });
      },
      setFund: (fund: DataOptionsProps | null) => {
        dispatch({ type: "SET_FUND", payload: fund });
      },
      setApprovalMemo: (approvalMemo: DocumentResponseData | null) => {
        dispatch({ type: "SET_APPROVAL_MEMO", payload: approvalMemo });
      },
      reorderContents: (contents: ContentAreaProps[]) => {
        dispatch({ type: "REORDER_CONTENTS", payload: contents });
      },
      setIsLoading: (loading: boolean) => {
        dispatch({ type: "SET_IS_LOADING", payload: loading });
      },
    }),
    [
      dispatch,
      state.category,
      state.template,
      state.contents,
      isWorkflowValid,
      workflowErrors,
    ]
  );

  const contextValue: PaperBoardContextType = useMemo(
    () => ({
      state,
      actions,
    }),
    [state, actions]
  );

  return (
    <PaperBoardContext.Provider value={contextValue}>
      {children}
    </PaperBoardContext.Provider>
  );
};
