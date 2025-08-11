import { ColumnData } from "@/resources/views/components/tables/CustomDataTable";
import {
  TemplateBoardState,
  TemplateBoardAction,
} from "./TemplateBoardContext";
import { BlockDataType } from "@/app/Repositories/Block/data";

export const templateBoardReducer = (
  state: TemplateBoardState,
  action: TemplateBoardAction
): TemplateBoardState => {
  switch (action.type) {
    case "SET_CATEGORY":
      return {
        ...state,
        category: action.payload,
        // Reset template when category changes
        template: null,
        contents: [],
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
      };

    case "SET_TEMPLATE":
      return {
        ...state,
        template: action.payload,
      };

    case "ADD_CONTENT": {
      // Initialize content based on block type
      const initializeContent = (type: string) => {
        const baseContent = {
          title: action.payload.block.title,
          tagline: "",
        };

        switch (type) {
          case "paragraph":
            return { ...baseContent, paragraph: { body: "" } };
          case "table":
            return { ...baseContent, table: { headers: [], rows: [] } };
          case "event":
            return {
              ...baseContent,
              event: {
                name: "",
                venue: "",
                start_date: "",
                end_date: "",
                start_time: "",
                address: "",
                location: "",
                type: "local",
                country: "",
                currency: "NGN",
                estacode: "USD",
                source: null,
                vendor_name: "",
              },
            };
          case "approval":
            return {
              ...baseContent,
              approval: {
                approvals: [],
                style: "basic",
                max_signatures: 6,
                originator_id: 0,
                originator_name: "",
                originator_department_id: 0,
              },
            };
          case "milestone":
            return {
              ...baseContent,
              milestone: { project: null, milestones: [] },
            };
          case "invoice":
            return {
              ...baseContent,
              invoice: {
                invoice: null,
                project: null,
                items: [],
                sub_total: 0,
                total: 0,
                vat: 0,
                service_charge: 0,
                markup: 0,
                currency: "NGN",
              },
            };
          case "expense":
            return {
              ...baseContent,
              expense: {
                loaded_type: "claim",
                expenses: [],
                claimState: null,
                headers: [],
              },
            };
          case "paper_title": {
            const paperTitleContent = {
              ...baseContent,
              paper_title: { title: "" },
            };
            return paperTitleContent;
          }
          default:
            return baseContent;
        }
      };

      const newContent = {
        id: crypto.randomUUID(),
        activeId: null,
        type: action.payload.type,
        isBeingEdited: false,
        isCollapsed: false,
        block_id: action.payload.block.id,
        name: action.payload.block.title,
        content: initializeContent(action.payload.type) as any,
        order: state.contents.length + 1,
      };

      return {
        ...state,
        contents: [...state.contents, newContent],
      };
    }

    case "UPDATE_CONTENT":
      return {
        ...state,
        contents: state.contents.map((content) => {
          if (content.id === action.payload.blockId) {
            // Handle nested updates properly
            let updatedContentData;
            if (action.payload.identifier.includes(".")) {
              // Handle nested property updates (e.g., "paper_title.title")
              const [parentKey, childKey] =
                action.payload.identifier.split(".");
              const parentContent =
                content.content?.[parentKey as keyof typeof content.content];

              // Ensure we don't duplicate the parent object
              updatedContentData = {
                ...content.content,
                [parentKey]: {
                  ...(parentContent as any),
                  [childKey]: action.payload.data,
                },
              };
            } else {
              // Handle direct property updates
              // Check if the data is already nested under the identifier
              const dataToSet =
                action.payload.data[action.payload.identifier] ||
                action.payload.data;

              updatedContentData = {
                ...content.content,
                [action.payload.identifier]: dataToSet,
              };
            }

            const updatedContent = {
              ...content,
              content: updatedContentData as any,
            };
            return updatedContent;
          }
          return content;
        }),
      };

    case "REMOVE_CONTENT":
      return {
        ...state,
        contents: state.contents
          .filter((content) => content.id !== action.payload)
          .map((content, index) => ({
            ...content,
            order: index + 1,
          })),
      };

    case "REORDER_CONTENTS":
      return {
        ...state,
        contents: action.payload.map((content, index) => ({
          ...content,
          order: index + 1,
        })),
      };

    case "UPDATE_CONFIG_STATE": {
      const newState = {
        ...state,
        configState: {
          ...state.configState,
          ...action.payload,
        },
      };
      return newState;
    }

    case "UPDATE_DOCUMENT_STATE":
      return {
        ...state,
        documentState: {
          ...state.documentState,
          ...action.payload,
        },
      };

    case "SET_RESOURCE":
      return {
        ...state,
        resource: action.payload,
      };

    case "SET_FUND":
      return {
        ...state,
        fund: action.payload,
      };

    case "SET_PARENT_DOCUMENT":
      return {
        ...state,
        parentDocument: action.payload,
      };

    case "SET_DOCUMENT_OWNER":
      return {
        ...state,
        document_owner: action.payload,
      };

    case "SET_DEPARTMENT_OWNER":
      return {
        ...state,
        department_owner: action.payload,
      };

    case "ADD_UPLOAD": {
      const newState = {
        ...state,
        uploads: [...state.uploads, action.payload],
      };
      return newState;
    }

    case "REMOVE_UPLOAD": {
      const newState = {
        ...state,
        uploads: state.uploads.filter((_, index) => index !== action.payload),
      };
      return newState;
    }

    case "SET_GENERATION_STATE":
      return {
        ...state,
        isGenerating: action.payload.isGenerating,
        loadingProgress: action.payload.progress ?? state.loadingProgress,
        loadingStep: action.payload.step ?? state.loadingStep,
      };

    case "SET_WORKFLOW":
      return {
        ...state,
        workflow: action.payload.workflow,
        trackers: action.payload.trackers,
      };

    case "SET_PROCESS_TYPE":
      return {
        ...state,
        processType: action.payload,
      };

    case "SET_VALIDATION":
      return {
        ...state,
        isValid: action.payload.isValid,
        errors: action.payload.errors,
      };

    // ContentBuilder Specific Actions
    case "SET_BLOCKS":
      return {
        ...state,
        blocks: action.payload,
      };

    case "SET_ACTIVE_BLOCK":
      return {
        ...state,
        activeBlockId: action.payload,
      };

    case "ADD_BLOCK_TO_SHEET": {
      // Initialize content based on block type
      const initializeContent = (type: string) => {
        const baseContent = {
          title: action.payload.block.title,
          tagline: "",
        };

        switch (type) {
          case "paragraph":
            return { ...baseContent, paragraph: { body: "" } };
          case "table":
            return { ...baseContent, table: { headers: [], rows: [] } };
          case "event":
            return {
              ...baseContent,
              event: {
                name: "",
                venue: "",
                start_date: "",
                end_date: "",
                start_time: "",
                address: "",
                location: "",
                type: "local",
                country: "",
                currency: "NGN",
                estacode: "USD",
                source: null,
                vendor_name: "",
              },
            };
          case "approval":
            return {
              ...baseContent,
              approval: {
                approvals: [],
                style: "basic",
                max_signatures: 6,
                originator_id: 0,
                originator_name: "",
                originator_department_id: 0,
              },
            };
          case "milestone":
            return {
              ...baseContent,
              milestone: { project: null, milestones: [] },
            };
          case "invoice":
            return {
              ...baseContent,
              invoice: {
                invoice: null,
                project: null,
                items: [],
                sub_total: 0,
                total: 0,
                vat: 0,
                service_charge: 0,
                markup: 0,
                currency: "NGN",
              },
            };
          case "expense":
            return {
              ...baseContent,
              expense: {
                loaded_type: "claim",
                expenses: [],
                claimState: null,
                headers: [],
              },
            };
          case "paper_title": {
            const paperTitleContent = {
              ...baseContent,
              paper_title: { title: "" },
            };
            return paperTitleContent;
          }
          default:
            return baseContent;
        }
      };

      const newContent = {
        id: crypto.randomUUID(),
        activeId: action.payload.block.id.toString(),
        type: action.payload.type,
        isBeingEdited: false,
        isCollapsed: true,
        block_id: action.payload.block.id,
        name: action.payload.block.title,
        content: initializeContent(action.payload.type) as any,
        order: state.contents.length + 1,
      };

      return {
        ...state,
        contents: [...state.contents, newContent],
        activeBlockId: newContent.id,
      };
    }

    case "REMOVE_BLOCK_FROM_SHEET":
      return {
        ...state,
        contents: state.contents
          .filter((content) => content.id !== action.payload)
          .map((content, index) => ({
            ...content,
            order: index + 1,
          })),
        activeBlockId:
          state.activeBlockId === action.payload ? null : state.activeBlockId,
      };

    case "COLLAPSE_BLOCK":
      return {
        ...state,
        contents: state.contents.map((content) =>
          content.id === action.payload
            ? { ...content, isCollapsed: true, isBeingEdited: false }
            : content
        ),
        activeBlockId: null,
      };

    case "RESOLVE_BLOCK":
      return {
        ...state,
        contents: state.contents.map((content) =>
          content.id === action.payload.blockId
            ? {
                ...content,
                content: action.payload.data,
                isCollapsed: true,
                isBeingEdited: false,
              }
            : content
        ),
        activeBlockId: null,
      };

    case "SET_BUILDING_STATE":
      return {
        ...state,
        isBuilding: action.payload.isBuilding,
        buildProgress: action.payload.progress ?? state.buildProgress,
        buildStep: action.payload.step ?? state.buildStep,
      };

    case "INITIALIZE_FROM_DOCUMENT": {
      const doc = action.payload;

      return {
        ...state, // Start with current state
        category: state.category,
        template: state.template,
        contents: state.contents,
        configState: state.configState,
        documentState: state.documentState,
        document_owner: state.document_owner,
        department_owner: state.department_owner,
        workflow: state.workflow,
        trackers: state.trackers,
        fund: state.fund,
        parentDocument: state.parentDocument,
        // Don't initialize uploads - let user re-upload if needed
        uploads: [],
        // Reset generation state
        isGenerating: false,
        loadingProgress: 0,
        loadingStep: "",
        isValid: true, // Assume existing document is valid
        errors: [],
      };
    }

    case "RESET_STATE":
      return {
        category: null,
        template: null,
        document_owner: null,
        department_owner: null,
        contents: [],
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
        documentState: {} as any,
        resource: null,
        workflow: null,
        trackers: [],
        processType: {} as any,
        uploads: [],
        fund: null,
        parentDocument: null,
        isGenerating: false,
        loadingProgress: 0,
        loadingStep: "",
        isValid: false,
        errors: [],
      };

    default:
      return state;
  }
};
