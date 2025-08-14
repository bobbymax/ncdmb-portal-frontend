import { createContext, useContext, useState } from "react";
import { DocumentCategoryResponseData } from "../Repositories/DocumentCategory/data";
import { TemplateResponseData } from "../Repositories/Template/data";
import { DataOptionsProps } from "@/resources/views/components/forms/MultiSelect";
import { ContentAreaProps } from "../Hooks/useBuilder";
import { ConfigState } from "../Hooks/useTemplateHeader";
import { BlockResponseData } from "../Repositories/Block/data";
import {
  DocumentResponseData,
  UploadResponseData,
} from "../Repositories/Document/data";
import { BaseResponse } from "../Repositories/BaseRepository";
import { ProgressTrackerResponseData } from "../Repositories/ProgressTracker/data";
import { WorkflowResponseData } from "../Repositories/Workflow/data";
import { ProcessTabsOption } from "@/resources/views/crud/ContentBuilder";

export interface PaperBoardState {
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string | null;
  context: "builder" | "generator" | "viewer";
  mode: "store" | "update";

  // Primary Data
  category: DocumentCategoryResponseData | null;
  template: TemplateResponseData | null;
  document_owner: DataOptionsProps | null;
  department_owner: DataOptionsProps | null;

  // Template Building Data
  contents: ContentAreaProps[];
  body: ContentAreaProps[]; // Contents from database
  configState: ConfigState;

  // ContentBuilder Specific State
  blocks: BlockResponseData[];
  activeBlockId: string | null;
  isBuilding: boolean;
  buildProgress: number;
  buildStep: string;

  // Document Generation Data
  documentState: DocumentResponseData | null;
  resource: BaseResponse | null;
  contentState: Record<string, unknown>;
  isGenerating: boolean;

  //Workflow Data
  workflow: WorkflowResponseData | null;
  trackers: ProgressTrackerResponseData[];
  processType: ProcessTabsOption;

  uploads: File[];
  fund: DataOptionsProps | null;
  approval_memo: DocumentResponseData | null;
}

export type PaperBoardAction =
  | { type: "INITIALIZE_FROM_DOCUMENT"; payload: DocumentResponseData }
  | {
      type: "SET_CATEGORY";
      payload: DocumentCategoryResponseData | null;
    }
  | {
      type: "SET_TEMPLATE";
      payload: TemplateResponseData | null;
    }
  | {
      type: "SET_DOCUMENT_OWNER";
      payload: DataOptionsProps | null;
    }
  | {
      type: "UPDATE_DOCUMENT_OWNER";
      payload: DataOptionsProps | null;
    }
  | {
      type: "UPDATE_DEPARTMENT_OWNER";
      payload: DataOptionsProps | null;
    }
  | {
      type: "SET_DEPARTMENT_OWNER";
      payload: DataOptionsProps | null;
    }
  | {
      type: "SET_CONTENTS";
      payload: ContentAreaProps[];
    }
  | {
      type: "ADD_CONTENT";
      payload: ContentAreaProps;
    }
  | {
      type: "UPDATE_CONTENT";
      payload: ContentAreaProps;
    }
  | {
      type: "DELETE_CONTENT";
      payload: string;
    }
  | {
      type: "SET_BODY";
      payload: ContentAreaProps[];
    }
  | {
      type: "SET_CONFIG_STATE";
      payload: ConfigState;
    }
  | {
      type: "UPDATE_CONFIG_STATE";
      payload: ConfigState;
    }
  | {
      type: "SET_BLOCKS";
      payload: BlockResponseData[];
    }
  | {
      type: "ADD_BLOCK";
      payload: BlockResponseData;
    }
  | {
      type: "DELETE_BLOCK";
      payload: string;
    }
  | {
      type: "UPDATE_BLOCK";
      payload: BlockResponseData;
    }
  | {
      type: "SET_ACTIVE_BLOCK_ID";
      payload: string | null;
    }
  | {
      type: "SET_IS_BUILDING";
      payload: boolean;
    }
  | {
      type: "SET_BUILD_PROGRESS";
      payload: number;
    }
  | {
      type: "SET_DOCUMENT_STATE";
      payload: DocumentResponseData | null;
    }
  | {
      type: "SET_RESOURCE";
      payload: BaseResponse | null;
    }
  | {
      type: "SET_UPLOADS";
      payload: { id: string; file: File }[];
    }
  | {
      type: "REMOVE_UPLOAD";
      payload: string;
    }
  | {
      type: "SET_FUND";
      payload: DataOptionsProps | null;
    }
  | {
      type: "SET_APPROVAL_MEMO";
      payload: DocumentResponseData | null;
    }
  | { type: "REORDER_CONTENTS"; payload: ContentAreaProps[] }
  | {
      type: "SET_WORKFLOW";
      payload: {
        workflow: WorkflowResponseData;
        trackers: ProgressTrackerResponseData[];
      };
    }
  | {
      type: "SET_IS_LOADING";
      payload: boolean;
    };

export interface PaperBoardContextType {
  state: PaperBoardState;
  actions: {
    setCategory: (category: DocumentCategoryResponseData | null) => void;
    setTemplate: (template: TemplateResponseData | null) => void;
    addContent: (content: ContentAreaProps) => void;
    updateContent: (content: ContentAreaProps) => void;
    deleteContent: (blockId: string) => void;
    setBody: (body: ContentAreaProps[]) => void;
    setConfigState: (configState: ConfigState) => void;
    updateConfigState: (configState: ConfigState) => void;
    setWorkflow: (
      workflow: WorkflowResponseData,
      trackers: ProgressTrackerResponseData[]
    ) => void;
    setBlocks: (blocks: BlockResponseData[]) => void;
    addBlock: (block: BlockResponseData) => void;
    deleteBlock: (blockId: string) => void;
    updateBlock: (block: BlockResponseData) => void;
    setActiveBlockId: (blockId: string | null) => void;
    setIsBuilding: (isBuilding: boolean) => void;
    setBuildProgress: (progress: number) => void;
    setDocumentState: (documentState: DocumentResponseData | null) => void;
    setResource: (resource: BaseResponse | null) => void;
    setUploads: (uploads: { id: string; file: File }[]) => void;
    removeUpload: (uploadId: string) => void;
    setFund: (fund: DataOptionsProps | null) => void;
    setApprovalMemo: (approvalMemo: DocumentResponseData | null) => void;
    setIsLoading: (loading: boolean) => void;
  };
}

export const PaperBoardContext = createContext<
  PaperBoardContextType | undefined
>(undefined);

export const usePaperBoard = () => {
  const context = useContext(PaperBoardContext);
  if (!context) {
    throw new Error("usePaperBoard must be used within a PaperBoardProvider");
  }
  return context;
};
