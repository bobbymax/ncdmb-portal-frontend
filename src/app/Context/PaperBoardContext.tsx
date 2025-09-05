import { createContext, useContext, useState } from "react";
import {
  CategoryProgressTrackerProps,
  CategoryWorkflowProps,
  DocumentCategoryResponseData,
  DocumentMetaDataProps,
  PointerThreadProps,
} from "../Repositories/DocumentCategory/data";
import { TemplateResponseData } from "../Repositories/Template/data";
import { DataOptionsProps } from "@/resources/views/components/forms/MultiSelect";
import { BlockResponseData } from "../Repositories/Block/data";
import { DocumentResponseData } from "../Repositories/Document/data";
import { BaseResponse } from "../Repositories/BaseRepository";
import { ProgressTrackerResponseData } from "../Repositories/ProgressTracker/data";
import { WorkflowResponseData } from "../Repositories/Workflow/data";
import {
  DeskComponentPropTypes,
  SheetProps,
} from "@/resources/views/pages/DocumentTemplateContent";
import { ContentBlock } from "@/resources/views/crud/DocumentTemplateBuilder";
import { ProcessFlowConfigProps } from "@/resources/views/crud/DocumentWorkflow";
import { UserResponseData } from "../Repositories/User/data";
import { DepartmentResponseData } from "../Repositories/Department/data";
import { FundResponseData } from "../Repositories/Fund/data";
import { GroupResponseData } from "../Repositories/Group/data";
import { WorkflowStageResponseData } from "../Repositories/WorkflowStage/data";
import { DocumentActionResponseData } from "../Repositories/DocumentAction/data";
import { CarderResponseData } from "../Repositories/Carder/data";
import { DocumentTypeResponseData } from "../Repositories/DocumentType/data";
import { AuthUserResponseData } from "./AuthContext";
import {
  SettingsProps,
  WatcherProps,
} from "@/resources/views/components/DocumentGeneratorTab/SettingsGeneratorTab";
import { DocumentRequirementResponseData } from "../Repositories/DocumentRequirement/data";

export type ContextType = "builder" | "generator" | "desk";

export type ResourceProps = {
  users: UserResponseData[];
  departments: DepartmentResponseData[];
  funds: FundResponseData[];
  groups: GroupResponseData[];
  workflowStages: WorkflowStageResponseData[];
  documentActions: DocumentActionResponseData[];
  services: string[];
  carders: CarderResponseData[];
  documentTypes: DocumentTypeResponseData[];
  workflows: WorkflowResponseData[];
};

export interface DocumentRequirementProps
  extends DocumentRequirementResponseData {
  is_required: boolean;
  is_present: boolean;
}

export type AccessLevelProps =
  | "looker"
  | "authority"
  | "approver"
  | "lock"
  | "admin"
  | "shared"
  | "system";

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

  // General Data
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string | null;
  context: ContextType;
  mode: "store" | "update";
  preferences: SettingsProps;
  watchers: WatcherProps[];
  threads: PointerThreadProps[];
  currentPointer: string | null;
  accessLevel: AccessLevelProps;
  sync: boolean;

  // Resources
  resources: ResourceProps;
  loggedInUser: AuthUserResponseData | undefined;
  requirements: DocumentRequirementProps[];
  existingDocument: DocumentResponseData | null;

  // Primary Data
  category: DocumentCategoryResponseData | null;
  template: TemplateResponseData | null;
  document_owner: DataOptionsProps | null;
  department_owner: DataOptionsProps | null;
  metaData: DocumentMetaDataProps | null;

  // Template Building Data
  contents: SheetProps[]; // Contents from template builder
  body: ContentBlock[]; // Contents from database
  configState: ProcessFlowConfigProps | null;
  resourceLinks: ContentBlock[];

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
      type: "SET_RESOURCE_LINKS";
      payload: ContentBlock[];
    }
  | {
      type: "ADD_RESOURCE_LINK";
      payload: ContentBlock;
    }
  | {
      type: "UPDATE_RESOURCE_LINK";
      payload: ContentBlock;
    }
  | {
      type: "DELETE_RESOURCE_LINK";
      payload: string;
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
      type: "SET_PREFERENCES";
      payload: SettingsProps;
    }
  | {
      type: "UPDATE_PREFERENCES";
      payload: SettingsProps;
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
      type: "ADD_UPLOAD";
      payload: File;
    }
  | {
      type: "REMOVE_UPLOAD";
      payload: string | number;
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
      type: "UPDATE_BODY";
      payload: { body: ContentBlock; type: DeskComponentPropTypes };
    }
  | {
      type: "SET_IS_LOADING";
      payload: boolean;
    }
  | {
      type: "SET_META_DATA";
      payload: DocumentMetaDataProps | null;
    }
  | {
      type: "UPDATE_META_DATA";
      payload: DocumentMetaDataProps | null;
    }
  | {
      type: "SET_RESOURCES";
      payload: ResourceProps;
    }
  | {
      type: "SET_LOGGED_IN_USER";
      payload: AuthUserResponseData | undefined;
    }
  | {
      type: "SET_WATCHERS";
      payload: WatcherProps[];
    }
  | {
      type: "SET_REQUIREMENTS";
      payload: DocumentRequirementProps[];
    }
  | {
      type: "UPDATE_REQUIREMENTS";
      payload: DocumentRequirementProps;
    }
  | {
      type: "SET_THREADS";
      payload: PointerThreadProps[];
    }
  | {
      type: "UPDATE_THREADS";
      payload: PointerThreadProps;
    }
  | {
      type: "SET_EXISTING_DOCUMENT";
      payload: DocumentResponseData | null;
    }
  | {
      type: "SET_CURRENT_POINTER";
      payload: string | null;
    }
  | {
      type: "SET_ACCESS_LEVEL";
      payload: AccessLevelProps;
    }
  | {
      type: "SET_CONTEXT";
      payload: "desk" | "generator";
    }
  | {
      type: "SET_SYNC";
      payload: boolean;
    };

export interface PaperBoardContextType {
  state: PaperBoardState;
  actions: {
    setCategory: (category: DocumentCategoryResponseData | null) => void;
    setTemplate: (template: TemplateResponseData | null) => void;
    setResourceLinks: (resourceLinks: ContentBlock[]) => void;
    addResourceLink: (resourceLink: ContentBlock) => void;
    updateResourceLink: (resourceLink: ContentBlock) => void;
    deleteResourceLink: (resourceLinkId: string) => void;
    addContent: (content: SheetProps) => void;
    addUpload: (upload: File) => void;
    updateContent: (content: SheetProps) => void;
    deleteContent: (blockId: string) => void;
    setBody: (body: ContentBlock[]) => void;
    updateBody: (body: ContentBlock, type: DeskComponentPropTypes) => void;
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
    removeUpload: (uploadId: string | number) => void;
    setFund: (fund: DataOptionsProps | null) => void;
    setApprovalMemo: (approvalMemo: DocumentResponseData | null) => void;
    setIsLoading: (loading: boolean) => void;
    setDepartmentOwner: (department: DataOptionsProps | null) => void;
    updateDepartmentOwner: (department: DataOptionsProps | null) => void;
    setDocumentOwner: (document: DataOptionsProps | null) => void;
    updateDocumentOwner: (document: DataOptionsProps | null) => void;
    setMetaData: (metaData: DocumentMetaDataProps | null) => void;
    updateMetaData: (metaData: DocumentMetaDataProps | null) => void;
    setResources: (resources: ResourceProps) => void;
    setLoggedInUser: (user: AuthUserResponseData | undefined) => void;
    setPreferences: (preferences: SettingsProps) => void;
    updatePreferences: (preferences: SettingsProps) => void;
    setWatchers: (watchers: WatcherProps[]) => void;
    setRequirements: (requirements: DocumentRequirementProps[]) => void;
    updateRequirements: (requirements: DocumentRequirementProps) => void;
    setThreads: (threads: PointerThreadProps[]) => void;
    updateThreads: (threads: PointerThreadProps) => void;
    setExistingDocument: (document: DocumentResponseData | null) => void;
    setCurrentPointer: (pointer: string | null) => void;
    setAccessLevel: (accessLevel: AccessLevelProps) => void;
    setContext: (context: "desk" | "generator") => void;
    setSync: (sync: boolean) => void;
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
