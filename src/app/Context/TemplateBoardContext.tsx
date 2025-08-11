import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { DocumentCategoryResponseData } from "@/app/Repositories/DocumentCategory/data";
import { TemplateResponseData } from "@/app/Repositories/Template/data";
import {
  ContentAreaProps,
  OptionsContentAreaProps,
} from "@/app/Hooks/useBuilder";
import { ConfigState } from "@/app/Hooks/useTemplateHeader";
import { DocumentResponseData } from "@/app/Repositories/Document/data";
import { WorkflowResponseData } from "@/app/Repositories/Workflow/data";
import { ProgressTrackerResponseData } from "@/app/Repositories/ProgressTracker/data";
import { ProcessTabsOption } from "@/resources/views/crud/ContentBuilder";
import { BaseResponse } from "@/app/Repositories/BaseRepository";
import { DataOptionsProps } from "@/resources/views/components/forms/MultiSelect";
import { BlockResponseData } from "@/app/Repositories/Block/data";
import { BlockDataType } from "@/app/Repositories/Block/data";

// State Interface
export interface TemplateBoardState {
  // Primary Requirements
  category: DocumentCategoryResponseData | null;
  template: TemplateResponseData | null;
  document_owner: DataOptionsProps | null;
  department_owner: DataOptionsProps | null;

  // Template Building
  contents: ContentAreaProps[];
  configState: ConfigState;

  // ContentBuilder Specific State
  blocks: BlockResponseData[];
  activeBlockId: string | null;
  isBuilding: boolean;
  buildProgress: number;
  buildStep: string;

  // Document Configuration
  documentState: DocumentResponseData;
  resource: BaseResponse | null;

  // Workflow & Process
  workflow: WorkflowResponseData | null;
  trackers: ProgressTrackerResponseData[];
  processType: ProcessTabsOption;

  // Supporting Data
  uploads: File[];
  fund: DataOptionsProps | null;
  parentDocument: DocumentResponseData | null;

  // UI State
  isGenerating: boolean;
  loadingProgress: number;
  loadingStep: string;

  // Validation State
  isValid: boolean;
  errors: string[];
}

// Action Types
export type TemplateBoardAction =
  | { type: "SET_CATEGORY"; payload: DocumentCategoryResponseData | null }
  | { type: "SET_TEMPLATE"; payload: TemplateResponseData | null }
  | {
      type: "ADD_CONTENT";
      payload: { block: BlockResponseData; type: BlockDataType };
    }
  | {
      type: "UPDATE_CONTENT";
      payload: { blockId: string; data: any; identifier: string };
    }
  | { type: "REMOVE_CONTENT"; payload: string }
  | { type: "REORDER_CONTENTS"; payload: ContentAreaProps[] }
  | { type: "UPDATE_CONFIG_STATE"; payload: Partial<ConfigState> }
  | { type: "UPDATE_DOCUMENT_STATE"; payload: Partial<DocumentResponseData> }
  | { type: "SET_RESOURCE"; payload: BaseResponse }
  | { type: "SET_FUND"; payload: DataOptionsProps | null }
  | { type: "SET_PARENT_DOCUMENT"; payload: DocumentResponseData | null }
  | { type: "SET_DOCUMENT_OWNER"; payload: DataOptionsProps | null }
  | { type: "SET_DEPARTMENT_OWNER"; payload: DataOptionsProps | null }
  | { type: "ADD_UPLOAD"; payload: File }
  | { type: "REMOVE_UPLOAD"; payload: number }
  | {
      type: "SET_GENERATION_STATE";
      payload: { isGenerating: boolean; progress?: number; step?: string };
    }
  | {
      type: "SET_WORKFLOW";
      payload: {
        workflow: WorkflowResponseData;
        trackers: ProgressTrackerResponseData[];
      };
    }
  | { type: "SET_PROCESS_TYPE"; payload: ProcessTabsOption }
  | { type: "SET_VALIDATION"; payload: { isValid: boolean; errors: string[] } }
  | { type: "INITIALIZE_FROM_DOCUMENT"; payload: DocumentResponseData }
  // ContentBuilder Specific Actions
  | { type: "SET_BLOCKS"; payload: BlockResponseData[] }
  | { type: "SET_ACTIVE_BLOCK"; payload: string | null }
  | {
      type: "ADD_BLOCK_TO_SHEET";
      payload: { block: BlockResponseData; type: BlockDataType };
    }
  | { type: "REMOVE_BLOCK_FROM_SHEET"; payload: string }
  | { type: "COLLAPSE_BLOCK"; payload: string }
  | {
      type: "RESOLVE_BLOCK";
      payload: { data: OptionsContentAreaProps; blockId: string };
    }
  | {
      type: "SET_BUILDING_STATE";
      payload: { isBuilding: boolean; progress?: number; step?: string };
    }
  | { type: "RESET_STATE" };

// Context Interface
export interface TemplateBoardContextType {
  state: TemplateBoardState;
  actions: {
    setCategory: (category: DocumentCategoryResponseData | null) => void;
    setTemplate: (template: TemplateResponseData | null) => void;
    addContent: (block: BlockResponseData, type: BlockDataType) => void;
    updateContent: (blockId: string, data: any, identifier: string) => void;
    removeContent: (blockId: string) => void;
    reorderContents: (contents: ContentAreaProps[]) => void;
    updateConfigState: (config: Partial<ConfigState>) => void;
    updateDocumentState: (updates: Partial<DocumentResponseData>) => void;
    setResource: (resource: BaseResponse) => void;
    setFund: (fund: DataOptionsProps | null) => void;
    setParentDocument: (document: DocumentResponseData | null) => void;
    setDocumentOwner: (owner: DataOptionsProps | null) => void;
    setDepartmentOwner: (department: DataOptionsProps | null) => void;
    addUpload: (file: File) => void;
    removeUpload: (index: number) => void;
    setGenerationState: (
      isGenerating: boolean,
      progress?: number,
      step?: string
    ) => void;
    setWorkflow: (
      workflow: WorkflowResponseData,
      trackers: ProgressTrackerResponseData[]
    ) => void;
    setProcessType: (processType: ProcessTabsOption) => void;
    validateState: () => boolean;
    resetState: () => void;
    initializeFromDocument: (document: DocumentResponseData) => void;
    // ContentBuilder Specific Actions
    setBlocks: (blocks: BlockResponseData[]) => void;
    setActiveBlock: (blockId: string | null) => void;
    addBlockToSheet: (block: BlockResponseData, type: BlockDataType) => void;
    removeBlockFromSheet: (blockId: string) => void;
    collapseBlock: (blockId: string) => void;
    resolveBlock: (data: OptionsContentAreaProps, blockId: string) => void;
    setBuildingState: (
      isBuilding: boolean,
      progress?: number,
      step?: string
    ) => void;
  };
}

// Initial State
const initialState: TemplateBoardState = {
  category: null,
  template: null,
  contents: [],
  document_owner: null,
  department_owner: null,
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

// Create Context
const TemplateBoardContext = createContext<
  TemplateBoardContextType | undefined
>(undefined);

// Custom Hook
export const useTemplateBoard = (): TemplateBoardContextType => {
  const context = useContext(TemplateBoardContext);
  if (!context) {
    throw new Error(
      "useTemplateBoard must be used within a TemplateBoardProvider. " +
        "Make sure your component is wrapped with TemplateBoardProvider."
    );
  }
  return context;
};

export default TemplateBoardContext;
