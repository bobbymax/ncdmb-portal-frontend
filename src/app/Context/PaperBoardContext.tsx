import { createContext, useContext, useState } from "react";
import {
  CategoryProgressTrackerProps,
  CategoryWorkflowProps,
  DocumentCategoryResponseData,
} from "../Repositories/DocumentCategory/data";
import { TemplateResponseData } from "../Repositories/Template/data";
import { DataOptionsProps } from "@/resources/views/components/forms/MultiSelect";
import { ContentAreaProps } from "../Hooks/useBuilder";
import { BlockResponseData } from "../Repositories/Block/data";
import { DocumentResponseData } from "../Repositories/Document/data";
import { BaseResponse } from "../Repositories/BaseRepository";
import { ProgressTrackerResponseData } from "../Repositories/ProgressTracker/data";
import { WorkflowResponseData } from "../Repositories/Workflow/data";
import { ProcessTabsOption } from "@/resources/views/crud/ContentBuilder";
import { SheetProps } from "@/resources/views/pages/DocumentTemplateContent";
import { ContentBlock } from "@/resources/views/crud/DocumentTemplateBuilder";
import { ProcessFlowConfigProps } from "@/resources/views/crud/DocumentWorkflow";
import { DocumentMetaDataProps } from "../Repositories/DocumentCategory/data";

export type ContextType = "builder" | "generator" | "desk";

export interface PaperBoardState {
  /**
   * @var category - The category of the document
   * @var template - The template of the document
   * @var document_owner - The owner of the document
   * @var department_owner - The department of the document
   * @var contents - The contents of the document from the template builder
   * @var body - The body of the document from template in the database
   * @var configState - The config state of the document from the category configuration
   * @var blocks - The blocks of the document from the template builder
   * @var activeBlockId - The active block id of the document
   * @var isBuilding - Whether the document is being built
   * @var documentState - The state of the document
   * @var resource - The resource of the document
   * @var isGenerating - Whether the document is being generated
   * @var workflow - The workflow of the document
   * @var trackers - The trackers of the document
   * @var uploads - The uploads of the document
   * @var fund - The fund of the document
   * @var approval_memo - The approval memo of the document
   */

  isLoading: boolean;
  hasError: boolean;
  errorMessage: string | null;
  context: ContextType;
  mode: "store" | "update";

  // Primary Data
  category: DocumentCategoryResponseData | null;
  template: TemplateResponseData | null;
  document_owner: DataOptionsProps | null;
  department_owner: DataOptionsProps | null;

  // Template Building Data
  contents: SheetProps[]; // Contents from template builder
  body: ContentBlock[]; // Contents from database
  configState: ProcessFlowConfigProps | null;

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
  workflow: CategoryWorkflowProps | null;
  trackers: CategoryProgressTrackerProps[];

  uploads: File[] | string[];
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
      payload: SheetProps[];
    }
  | {
      type: "ADD_CONTENT";
      payload: SheetProps;
    }
  | {
      type: "UPDATE_CONTENT";
      payload: SheetProps;
    }
  | {
      type: "DELETE_CONTENT";
      payload: string;
    }
  | {
      type: "SET_BODY";
      payload: ContentBlock[];
    }
  | {
      type: "SET_CONFIG_STATE";
      payload: ProcessFlowConfigProps | null;
    }
  | {
      type: "UPDATE_CONFIG_STATE";
      payload: ProcessFlowConfigProps | null;
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
  | { type: "REORDER_CONTENTS"; payload: SheetProps[] }
  | {
      type: "SET_WORKFLOW";
      payload: {
        workflow: CategoryWorkflowProps;
        trackers: CategoryProgressTrackerProps[];
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
    addContent: (content: SheetProps) => void;
    updateContent: (content: SheetProps) => void;
    deleteContent: (blockId: string) => void;
    setBody: (body: ContentBlock[]) => void;
    setConfigState: (configState: ProcessFlowConfigProps | null) => void;
    updateConfigState: (configState: ProcessFlowConfigProps | null) => void;
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
