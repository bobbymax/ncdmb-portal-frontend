import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { useReducer } from "react";
import TemplateBoardContext, {
  TemplateBoardContextType,
  TemplateBoardState,
} from "./TemplateBoardContext";
import { templateBoardReducer } from "./TemplateBoardReducer";
import { DocumentCategoryResponseData } from "@/app/Repositories/DocumentCategory/data";
import { TemplateResponseData } from "@/app/Repositories/Template/data";
import { BlockResponseData } from "@/app/Repositories/Block/data";
import { BlockDataType } from "@/app/Repositories/Block/data";
import {
  ContentAreaProps,
  OptionsContentAreaProps,
} from "app/Hooks/useBuilder";
import { ConfigState } from "app/Hooks/useTemplateHeader";
import { DocumentResponseData } from "@/app/Repositories/Document/data";
import { WorkflowResponseData } from "@/app/Repositories/Workflow/data";
import { ProgressTrackerResponseData } from "@/app/Repositories/ProgressTracker/data";
import { ProcessTabsOption } from "@/resources/views/crud/ContentBuilder";
import { BaseResponse } from "@/app/Repositories/BaseRepository";
import { DataOptionsProps } from "resources/views/components/forms/MultiSelect";
import { useAuth } from "./AuthContext";
import { useParams } from "react-router-dom";
import useDocumentGenerator from "app/Hooks/useDocumentGenerator";
import useWorkflowTransformer from "app/Hooks/useWorkflowTransformer";
import { TemplateBoardMigration } from "./TemplateBoardMigration";

interface TemplateBoardProviderProps {
  children: React.ReactNode;
}

export const TemplateBoardProvider: React.FC<TemplateBoardProviderProps> = ({
  children,
}) => {
  const initialState: TemplateBoardState = {
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
          permissions: {} as any,
        },
      },
      to: {
        key: "to",
        state: {
          process_type: "to",
          stage: null,
          group: null,
          department: null,
          permissions: {} as any,
        },
      },
      through: {
        key: "through",
        state: {
          process_type: "through",
          stage: null,
          group: null,
          department: null,
          permissions: {} as any,
        },
      },
      cc: { key: "cc", state: [] },
      approvers: { key: "approvers", state: [] },
    },
    // ContentBuilder Specific State
    blocks: [],
    activeBlockId: null,
    isBuilding: false,
    buildProgress: 0,
    buildStep: "",
    documentState: {} as DocumentResponseData,
    resource: null,
    workflow: null,
    trackers: [],
    processType: {} as ProcessTabsOption,
    uploads: [],
    fund: null,
    parentDocument: null,
    isGenerating: false,
    loadingProgress: 0,
    loadingStep: "",
    isValid: false,
    errors: [],
  };

  const [state, dispatch] = useReducer(templateBoardReducer, initialState);

  const { staff } = useAuth();
  const params = useParams();

  // Initialize from URL params if available
  const {
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
      // Convert ContentBlock[] to the expected type for REORDER_CONTENTS
      const convertedContents = urlEditedContents.map((content, index) => ({
        id: content.id || `content-${index}`,
        activeId: content.id || `content-${index}`,
        name: content.block?.title || `Content ${index + 1}`,
        type: content.block?.data_type || "text",
        isBeingEdited: false,
        block_id: content.block?.id || index + 1,
        isCollapsed: false,
        order: index + 1,
        content: {
          title: content.block?.title || `Content ${index + 1}`,
          tagline: "",
        },
        comments: content.comments || [],
        source: content.block?.data_type || "text",
      }));
      dispatch({ type: "REORDER_CONTENTS", payload: convertedContents });
    }
  }, [
    urlCategory,
    urlTemplate,
    urlEditedContents,
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

  // Individual action functions removed - now defined inline in actions object

  // Actions object - create once and never recreate using dispatch directly
  const actions = useMemo(
    () => ({
      setCategory: (category: DocumentCategoryResponseData | null) => {
        dispatch({ type: "SET_CATEGORY", payload: category });
      },
      setTemplate: (template: TemplateResponseData | null) => {
        dispatch({ type: "SET_TEMPLATE", payload: template });
      },
      addContent: (block: BlockResponseData, type: BlockDataType) => {
        dispatch({ type: "ADD_CONTENT", payload: { block, type } });
      },
      updateContent: (blockId: string, data: any, identifier: string) => {
        dispatch({
          type: "UPDATE_CONTENT",
          payload: { blockId, data, identifier },
        });
      },
      removeContent: (blockId: string) => {
        dispatch({ type: "REMOVE_CONTENT", payload: blockId });
      },
      reorderContents: (contents: ContentAreaProps[]) => {
        dispatch({ type: "REORDER_CONTENTS", payload: contents });
      },
      updateConfigState: (config: Partial<ConfigState>) => {
        dispatch({ type: "UPDATE_CONFIG_STATE", payload: config });
      },
      updateDocumentState: (updates: Partial<DocumentResponseData>) => {
        dispatch({ type: "UPDATE_DOCUMENT_STATE", payload: updates });
      },
      setResource: (resource: BaseResponse) => {
        dispatch({ type: "SET_RESOURCE", payload: resource });
      },
      setFund: (fund: DataOptionsProps | null) => {
        dispatch({ type: "SET_FUND", payload: fund });
      },
      setParentDocument: (document: DocumentResponseData | null) => {
        dispatch({ type: "SET_PARENT_DOCUMENT", payload: document });
      },
      setDocumentOwner: (owner: DataOptionsProps | null) => {
        dispatch({ type: "SET_DOCUMENT_OWNER", payload: owner });
      },
      setDepartmentOwner: (department: DataOptionsProps | null) => {
        dispatch({ type: "SET_DEPARTMENT_OWNER", payload: department });
      },
      addUpload: (file: File) => {
        dispatch({ type: "ADD_UPLOAD", payload: file });
      },
      removeUpload: (index: number) => {
        dispatch({ type: "REMOVE_UPLOAD", payload: index });
      },
      setGenerationState: (
        isGenerating: boolean,
        progress?: number,
        step?: string
      ) => {
        dispatch({
          type: "SET_GENERATION_STATE",
          payload: { isGenerating, progress, step },
        });
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
      setProcessType: (processType: ProcessTabsOption) => {
        dispatch({ type: "SET_PROCESS_TYPE", payload: processType });
      },
      validateState: () => {
        const errors: string[] = [];

        // Validate state structure using migration utility
        const structureValidation = TemplateBoardMigration.validateState(state);
        if (!structureValidation.isValid) {
          errors.push(...structureValidation.errors);
        }

        if (!state.category) {
          errors.push("Document category is required");
        }

        if (!state.template) {
          errors.push("Template is required");
        }

        if (state.contents.length === 0) {
          errors.push("At least one content block is required");
        }

        if (!isWorkflowValid) {
          errors.push(...workflowErrors);
        }

        const isValid = errors.length === 0;
        dispatch({ type: "SET_VALIDATION", payload: { isValid, errors } });

        return isValid;
      },
      resetState: () => {
        dispatch({ type: "RESET_STATE" });
      },
      initializeFromDocument: (document: DocumentResponseData) => {
        dispatch({ type: "INITIALIZE_FROM_DOCUMENT", payload: document });
      },
      setBlocks: (blocks: BlockResponseData[]) => {
        dispatch({ type: "SET_BLOCKS", payload: blocks });
      },
      setActiveBlock: (blockId: string | null) => {
        dispatch({ type: "SET_ACTIVE_BLOCK", payload: blockId });
      },
      addBlockToSheet: (block: BlockResponseData, type: BlockDataType) => {
        dispatch({ type: "ADD_BLOCK_TO_SHEET", payload: { block, type } });
      },
      removeBlockFromSheet: (blockId: string) => {
        dispatch({ type: "REMOVE_BLOCK_FROM_SHEET", payload: blockId });
      },
      collapseBlock: (blockId: string) => {
        dispatch({ type: "COLLAPSE_BLOCK", payload: blockId });
      },
      resolveBlock: (data: OptionsContentAreaProps, blockId: string) => {
        dispatch({ type: "RESOLVE_BLOCK", payload: { data, blockId } });
      },
      setBuildingState: (
        isBuilding: boolean,
        progress?: number,
        step?: string
      ) => {
        dispatch({
          type: "SET_BUILDING_STATE",
          payload: { isBuilding, progress, step },
        });
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

  const contextValue: TemplateBoardContextType = useMemo(
    () => ({
      state,
      actions,
    }),
    [state, actions]
  );

  return (
    <TemplateBoardContext.Provider value={contextValue}>
      {children}
    </TemplateBoardContext.Provider>
  );
};
