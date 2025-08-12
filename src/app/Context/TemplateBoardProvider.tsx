import React, { useCallback, useEffect, useMemo } from "react";
import { useReducer } from "react";
import TemplateBoardContext, {
  TemplateBoardContextType,
  TemplateBoardState,
  TemplateBoardAction,
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

  // Initialize state from URL params
  useEffect(() => {
    if (urlCategory && !state.category) {
      dispatch({ type: "SET_CATEGORY", payload: urlCategory });
    }
    if (urlTemplate && !state.template) {
      dispatch({ type: "SET_TEMPLATE", payload: urlTemplate });
    }
    if (urlEditedContents.length > 0 && state.contents.length === 0) {
      dispatch({ type: "REORDER_CONTENTS", payload: urlEditedContents });
    }
    if (urlConfigState && Object.keys(urlConfigState).length > 0) {
      // Only update if configState is actually different to prevent infinite loops
      const currentConfigState = state.configState;
      if (
        JSON.stringify(urlConfigState) !== JSON.stringify(currentConfigState)
      ) {
        dispatch({ type: "UPDATE_CONFIG_STATE", payload: urlConfigState });
      }
    }
  }, [
    urlCategory,
    urlTemplate,
    urlEditedContents,
    urlConfigState,
    state.category,
    state.template,
    state.contents,
    state.configState,
  ]);

  // Update workflow when configState changes
  useEffect(() => {
    if (transformedWorkflow && transformedTrackers) {
      // Only update if the workflow has actually changed to prevent infinite loops
      const currentWorkflow = state.workflow;
      const currentTrackers = state.trackers;

      if (
        JSON.stringify(transformedWorkflow) !==
          JSON.stringify(currentWorkflow) ||
        JSON.stringify(transformedTrackers) !== JSON.stringify(currentTrackers)
      ) {
        dispatch({
          type: "SET_WORKFLOW",
          payload: {
            workflow: transformedWorkflow,
            trackers: transformedTrackers,
          },
        });
      }
    }
  }, [
    transformedWorkflow,
    transformedTrackers,
    state.workflow,
    state.trackers,
  ]);

  // Actions using useCallback for individual functions
  const setCategory = useCallback(
    (category: DocumentCategoryResponseData | null) => {
      dispatch({ type: "SET_CATEGORY", payload: category });
    },
    []
  );

  const setTemplate = useCallback((template: TemplateResponseData | null) => {
    dispatch({ type: "SET_TEMPLATE", payload: template });
  }, []);

  const addContent = useCallback(
    (block: BlockResponseData, type: BlockDataType) => {
      dispatch({ type: "ADD_CONTENT", payload: { block, type } });
    },
    []
  );

  const updateContent = useCallback(
    (blockId: string, data: any, identifier: string) => {
      dispatch({
        type: "UPDATE_CONTENT",
        payload: { blockId, data, identifier },
      });
    },
    []
  );

  const removeContent = useCallback((blockId: string) => {
    dispatch({ type: "REMOVE_CONTENT", payload: blockId });
  }, []);

  const reorderContents = useCallback((contents: ContentAreaProps[]) => {
    dispatch({ type: "REORDER_CONTENTS", payload: contents });
  }, []);

  const updateConfigState = useCallback((config: Partial<ConfigState>) => {
    dispatch({ type: "UPDATE_CONFIG_STATE", payload: config });
  }, []);

  const updateDocumentState = useCallback(
    (updates: Partial<DocumentResponseData>) => {
      dispatch({ type: "UPDATE_DOCUMENT_STATE", payload: updates });
    },
    []
  );

  const setResource = useCallback((resource: BaseResponse) => {
    dispatch({ type: "SET_RESOURCE", payload: resource });
  }, []);

  const setFund = useCallback((fund: DataOptionsProps | null) => {
    dispatch({ type: "SET_FUND", payload: fund });
  }, []);

  const setParentDocument = useCallback(
    (document: DocumentResponseData | null) => {
      dispatch({ type: "SET_PARENT_DOCUMENT", payload: document });
    },
    []
  );

  const setDocumentOwner = useCallback((owner: DataOptionsProps | null) => {
    dispatch({ type: "SET_DOCUMENT_OWNER", payload: owner });
  }, []);

  const setDepartmentOwner = useCallback(
    (department: DataOptionsProps | null) => {
      dispatch({ type: "SET_DEPARTMENT_OWNER", payload: department });
    },
    []
  );

  const addUpload = useCallback((file: File) => {
    dispatch({ type: "ADD_UPLOAD", payload: file });
  }, []);

  const removeUpload = useCallback((index: number) => {
    dispatch({ type: "REMOVE_UPLOAD", payload: index });
  }, []);

  const setGenerationState = useCallback(
    (isGenerating: boolean, progress?: number, step?: string) => {
      dispatch({
        type: "SET_GENERATION_STATE",
        payload: { isGenerating, progress, step },
      });
    },
    []
  );

  const setWorkflow = useCallback(
    (
      workflow: WorkflowResponseData,
      trackers: ProgressTrackerResponseData[]
    ) => {
      dispatch({
        type: "SET_WORKFLOW",
        payload: { workflow, trackers },
      });
    },
    []
  );

  const setProcessType = useCallback((processType: ProcessTabsOption) => {
    dispatch({ type: "SET_PROCESS_TYPE", payload: processType });
  }, []);

  const validateState = useCallback(() => {
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
  }, [state, isWorkflowValid, workflowErrors]);

  const resetState = useCallback(() => {
    dispatch({ type: "RESET_STATE" });
  }, []);

  const initializeFromDocument = useCallback(
    (document: DocumentResponseData) => {
      dispatch({ type: "INITIALIZE_FROM_DOCUMENT", payload: document });
    },
    []
  );

  // ContentBuilder Specific Actions
  const setBlocks = useCallback((blocks: BlockResponseData[]) => {
    dispatch({ type: "SET_BLOCKS", payload: blocks });
  }, []);

  const setActiveBlock = useCallback((blockId: string | null) => {
    dispatch({ type: "SET_ACTIVE_BLOCK", payload: blockId });
  }, []);

  const addBlockToSheet = useCallback(
    (block: BlockResponseData, type: BlockDataType) => {
      dispatch({ type: "ADD_BLOCK_TO_SHEET", payload: { block, type } });
    },
    []
  );

  const removeBlockFromSheet = useCallback((blockId: string) => {
    dispatch({ type: "REMOVE_BLOCK_FROM_SHEET", payload: blockId });
  }, []);

  const collapseBlock = useCallback((blockId: string) => {
    dispatch({ type: "COLLAPSE_BLOCK", payload: blockId });
  }, []);

  const resolveBlock = useCallback(
    (data: OptionsContentAreaProps, blockId: string) => {
      dispatch({ type: "RESOLVE_BLOCK", payload: { data, blockId } });
    },
    []
  );

  const setBuildingState = useCallback(
    (isBuilding: boolean, progress?: number, step?: string) => {
      dispatch({
        type: "SET_BUILDING_STATE",
        payload: { isBuilding, progress, step },
      });
    },
    []
  );

  // Actions object - create once and never recreate
  const actions = useMemo(
    () => ({
      setCategory,
      setTemplate,
      addContent,
      updateContent,
      removeContent,
      reorderContents,
      updateConfigState,
      updateDocumentState,
      setResource,
      setFund,
      setParentDocument,
      setDocumentOwner,
      setDepartmentOwner,
      addUpload,
      removeUpload,
      setGenerationState,
      setWorkflow,
      setProcessType,
      validateState,
      resetState,
      initializeFromDocument,
      setBlocks,
      setActiveBlock,
      addBlockToSheet,
      removeBlockFromSheet,
      collapseBlock,
      resolveBlock,
      setBuildingState,
    }),
    [] // Empty dependency array - create once and never recreate
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
