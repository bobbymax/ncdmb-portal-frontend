import { ProcessTabsOption } from "@/resources/views/crud/ContentBuilder";
import {
  PaperBoardContext,
  PaperBoardContextType,
  PaperBoardState,
} from "./PaperBoardContext";
import { useEffect, useMemo, useReducer, useRef } from "react";
import { paperBoardReducer } from "./PaperBoardReducer";
import { useAuth } from "./AuthContext";
import { useParams } from "react-router-dom";
import useDocumentGenerator from "../Hooks/useDocumentGenerator";
import { ContentBlock } from "@/resources/views/crud/DocumentTemplateBuilder";
import { SheetProps } from "@/resources/views/pages/DocumentTemplateContent";
import { TemplateResponseData } from "../Repositories/Template/data";
import { WorkflowResponseData } from "../Repositories/Workflow/data";
import { BlockResponseData } from "../Repositories/Block/data";
import { BaseResponse } from "../Repositories/BaseRepository";
import { DataOptionsProps } from "@/resources/views/components/forms/MultiSelect";
import { DocumentResponseData } from "../Repositories/Document/data";
import { DocumentCategoryResponseData } from "../Repositories/DocumentCategory/data";
import { ProgressTrackerResponseData } from "../Repositories/ProgressTracker/data";
import { ProcessFlowConfigProps } from "@/resources/views/crud/DocumentWorkflow";
import {
  CategoryWorkflowProps,
  CategoryProgressTrackerProps,
} from "../Repositories/DocumentCategory/data";

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
    blocks: urlBlocks,
    workflow: urlWorkflow,
    trackers: urlTrackers,
    body: urlBody,
    isBuilding: urlIsBuilding,
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

    if (
      urlEditedContents.length > 0 &&
      state.contents.length === 0 &&
      !initializedRef.current.contents
    ) {
      initializedRef.current.contents = true;
      // Convert ContentBlock[] to SheetProps[] if needed
      const sheetProps: SheetProps[] = urlEditedContents.map(
        (content, index) => ({
          id: content.id || `content-${index}`,
          order: index + 1,
          text: content.content?.text || {},
          table: content.content?.table || {},
          list: content.content?.list || {},
          header: content.content?.header || {},
          event: content.content?.event || {},
        })
      );
      dispatch({ type: "REORDER_CONTENTS", payload: sheetProps });
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
    state.category,
    state.template,
    state.contents,
    state.blocks,
    state.workflow,
    state.body,
  ]);

  const actions = useMemo(
    () => ({
      setCategory: (category: DocumentCategoryResponseData | null) => {
        dispatch({ type: "SET_CATEGORY", payload: category });
      },
      setTemplate: (template: TemplateResponseData | null) => {
        dispatch({ type: "SET_TEMPLATE", payload: template });
      },
      addContent: (content: SheetProps) => {
        dispatch({ type: "ADD_CONTENT", payload: content });
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
      setIsLoading: (loading: boolean) => {
        dispatch({ type: "SET_IS_LOADING", payload: loading });
      },
    }),
    [dispatch]
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
