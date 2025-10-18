import { SheetProps } from "resources/views/pages/DocumentTemplateContent";
import { ContentBlock } from "resources/views/crud/DocumentTemplateBuilder";
import { PaperBoardAction, PaperBoardState } from "./PaperBoardContext";

// Helper function to sync body with contents
const syncBodyWithContents = (contents: SheetProps[]): SheetProps[] => {
  return contents.map((content, index) => ({
    ...content,
    order: index + 1, // Ensure order is always sequential
  }));
};

// Helper function to sync body with ContentBlock
const syncBodyWithContentBlock = (contents: ContentBlock[]): ContentBlock[] => {
  return contents.map((content, index) => ({
    ...content,
    order: index + 1, // Ensure order is always sequential
  }));
};

export const paperBoardReducer = (
  state: PaperBoardState,
  action: PaperBoardAction
): PaperBoardState => {
  switch (action.type) {
    case "SET_CATEGORY":
      return {
        ...state,
        category: action.payload,
      };
    case "SET_TEMPLATE":
      return {
        ...state,
        template: action.payload,
      };
    case "SET_DOCUMENT_OWNER":
      return {
        ...state,
        document_owner: action.payload,
      };
    case "UPDATE_DOCUMENT_OWNER":
      return {
        ...state,
        document_owner: action.payload,
      };
    case "SET_DEPARTMENT_OWNER":
      return {
        ...state,
        department_owner: action.payload,
      };
    case "UPDATE_DEPARTMENT_OWNER":
      return {
        ...state,
        department_owner: action.payload,
      };
    case "SET_CONTENTS":
      return {
        ...state,
        contents: syncBodyWithContents(action.payload),
      };
    case "SET_RESOURCE_LINKS":
      return {
        ...state,
        resourceLinks: action.payload,
      };
    case "ADD_RESOURCE_LINK":
      return {
        ...state,
        resourceLinks: [...state.resourceLinks, action.payload],
      };
    case "UPDATE_RESOURCE_LINK":
      return {
        ...state,
        resourceLinks: state.resourceLinks.map((link) =>
          link.id === action.payload.id ? action.payload : link
        ),
      };
    case "DELETE_RESOURCE_LINK":
      return {
        ...state,
        resourceLinks: state.resourceLinks.filter(
          (link) => link.id !== action.payload
        ),
      };
    case "ADD_CONTENT":
      return {
        ...state,
        contents: [...state.contents, action.payload],
      };
    case "UPDATE_CONTENT":
      return {
        ...state,
        contents: state.contents.map((content) =>
          content.id === action.payload.id ? action.payload : content
        ),
      };
    case "SET_BODY":
      return {
        ...state,
        body: syncBodyWithContentBlock(action.payload),
      };
    case "SET_CONFIG_STATE":
      return {
        ...state,
        configState: action.payload,
      };
    case "UPDATE_CONFIG_STATE":
      return {
        ...state,
        configState: action.payload,
      };
    case "SET_WORKFLOW":
      return {
        ...state,
        workflow: action.payload.workflow,
        trackers: action.payload.trackers,
      };
    case "SET_BLOCKS":
      return {
        ...state,
        blocks: action.payload,
      };
    case "ADD_BLOCK":
      return {
        ...state,
        blocks: [...state.blocks, action.payload],
      };
    case "DELETE_BLOCK":
      return {
        ...state,
        // blocks: state.blocks.filter((block) => block.id !== action.payload),
      };
    case "UPDATE_BLOCK":
      return {
        ...state,
        blocks: state.blocks.map((block) =>
          block.id === action.payload.id ? action.payload : block
        ),
      };
    case "SET_ACTIVE_BLOCK_ID":
      return {
        ...state,
        activeBlockId: action.payload,
      };
    case "SET_IS_BUILDING":
      return {
        ...state,
        isBuilding: action.payload,
      };
    case "SET_BUILD_PROGRESS":
      return {
        ...state,
        buildProgress: action.payload,
      };
    case "SET_DOCUMENT_STATE":
      return {
        ...state,
        documentState: action.payload,
      };
    case "SET_RESOURCE":
      return {
        ...state,
        resource: action.payload,
      };
    case "SET_UPLOADS":
      return {
        ...state,
        uploads: action.payload.map((upload) => upload.file),
      };
    case "ADD_UPLOAD":
      return {
        ...state,
        uploads: [...state.uploads, action.payload],
      };
    case "REMOVE_UPLOAD": {
      const filteredUploads = (state.uploads as (File | string)[]).filter(
        (upload) => {
          if (typeof upload === "string") {
            return upload !== action.payload;
          }
          return upload.name !== action.payload;
        }
      );

      return {
        ...state,
        uploads: filteredUploads as typeof state.uploads,
      };
    }
    case "SET_FUND":
      return {
        ...state,
        fund: action.payload,
      };
    case "SET_APPROVAL_MEMO":
      return {
        ...state,
        approval_memo: action.payload,
      };
    case "INITIALIZE_FROM_DOCUMENT":
      return {
        ...state,
        ...action.payload,
        uploads: [],
        workflow: state.workflow,
      } as PaperBoardState;
    case "REORDER_CONTENTS":
      return {
        ...state,
        contents: action.payload,
      };
    case "UPDATE_BODY":
      return {
        ...state,
        body: state.body.map((body) =>
          body.type === action.payload.type ? action.payload.body : body
        ),
      };
    case "SET_META_DATA":
      return {
        ...state,
        metaData: action.payload,
      };
    case "UPDATE_META_DATA":
      return {
        ...state,
        metaData: action.payload,
      };
    // SET_RESOURCES case removed - resources now managed by ResourceContext
    case "SET_LOGGED_IN_USER":
      return {
        ...state,
        loggedInUser: action.payload,
      };
    case "SET_PREFERENCES":
      return {
        ...state,
        preferences: action.payload,
      };
    case "UPDATE_PREFERENCES":
      return {
        ...state,
        preferences: action.payload,
      };
    case "SET_WATCHERS":
      return {
        ...state,
        watchers: action.payload,
      };
    case "SET_REQUIREMENTS":
      return {
        ...state,
        requirements: action.payload,
      };
    case "UPDATE_REQUIREMENTS":
      return {
        ...state,
        requirements: state.requirements.map((requirement) =>
          requirement.id === action.payload.id ? action.payload : requirement
        ),
      };
    case "SET_THREADS":
      return {
        ...state,
        threads: action.payload,
      };
    case "UPDATE_THREADS":
      return {
        ...state,
        threads: state.threads.some(
          (t) => t.identifier === action.payload.identifier
        )
          ? state.threads.map((thread) =>
              thread.identifier === action.payload.identifier
                ? action.payload
                : thread
            )
          : [...state.threads, action.payload], // Add if not exists
      };
    case "SET_EXISTING_DOCUMENT":
      return {
        ...state,
        existingDocument: action.payload,
      };
    case "SET_CURRENT_POINTER":
      return {
        ...state,
        currentPointer: action.payload,
      };
    case "SET_ACCESS_LEVEL":
      return {
        ...state,
        accessLevel: action.payload,
      };
    case "SET_CONTEXT":
      return {
        ...state,
        context: action.payload,
      };
    case "SET_SYNC":
      return {
        ...state,
        sync: action.payload,
      };
    case "ADD_DOCUMENT_ACTIVITY":
      return {
        ...state,
        documentActivities: [...state.documentActivities, action.payload].slice(
          -200
        ), // Keep last 200 activities
      };
    case "CLEAR_DOCUMENT_ACTIVITIES":
      return {
        ...state,
        documentActivities: [],
      };
    case "SET_TRACKERS":
      return {
        ...state,
        trackers: action.payload,
      };
    default:
      return state;
  }
};
