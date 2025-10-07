import { BaseRepository } from "@/app/Repositories/BaseRepository";
import {
  DocumentCategoryResponseData,
  CategoryProgressTrackerProps,
  PointerActivityTypesProps,
} from "app/Repositories/DocumentCategory/data";
import { DocumentResponseData } from "@/app/Repositories/Document/data";
import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  Suspense,
  lazy,
} from "react";
import { ContextType, usePaperBoard } from "app/Context/PaperBoardContext";
import { useResourceContext } from "app/Context/ResourceContext";
import { ContentBlock } from "@/resources/views/crud/DocumentTemplateBuilder";
import { useTemplateHeader } from "app/Hooks/useTemplateHeader";
import { useCore } from "app/Hooks/useCore";
import { useActivityLogger } from "app/Hooks/useActivityLogger";
import moment from "moment";

// Lazy load heavy components
const BudgetGeneratorTab = lazy(
  () => import("../components/DocumentGeneratorTab/BudgetGeneratorTab")
);
const UploadsGeneratorTab = lazy(
  () => import("../components/DocumentGeneratorTab/UploadsGeneratorTab")
);
const ResourceGeneratorTab = lazy(
  () => import("../components/DocumentGeneratorTab/ResourceGeneratorTab")
);
const SettingsGeneratorTab = lazy(
  () => import("../components/DocumentGeneratorTab/SettingsGeneratorTab")
);
import A4Sheet from "../components/pages/A4Sheet";
import Alert from "app/Support/Alert";
import { useNavigate } from "react-router-dom";
import { PaperTitleContent } from "../components/ContentCards/PaperTitleContentCard";
import { DocumentActionResponseData } from "@/app/Repositories/DocumentAction/data";
import { SignatureResponseData } from "@/app/Repositories/Signature/data";
import { SelectedActionsProps } from "../crud/DocumentCategoryConfiguration";
import Button from "../components/forms/Button";
import ActivitiesGeneratorTab from "../components/DocumentGeneratorTab/ActivitiesGeneratorTab";
import PdfViewer from "../components/pages/PdfViewer";
import PrintDocumentNew from "../components/pages/PrintDocumentNew";
import DocumentMessaging from "../components/pages/DocumentMessaging";
import { usePdfMerger } from "app/Hooks/usePdfMerger";
import { useStateContext } from "app/Context/ContentContext";
import { ThreadResponseData } from "@/app/Repositories/Thread/data";
import ProcessGeneratorTab from "../components/DocumentGeneratorTab/ProcessGeneratorTab";

export type DeskComponentPropTypes =
  | "paper_title"
  | "payment_batch"
  | "title"
  | "paragraph"
  | "expense"
  | "invoice"
  | "requisition"
  | "signature"
  | "text"
  | "table"
  | "list"
  | "header"
  | "event";

interface DocumentTemplateContentProps {
  Repository: BaseRepository;
  ResourceGeneratorComponent: React.ComponentType<any>;
  category: DocumentCategoryResponseData | null;
  editedContents: ContentBlock[];
  mode: "store" | "update";
  existingDocument?: DocumentResponseData | null;
}

export type SheetProps = {
  id: string;
  order: number;
} & {
  [key in DeskComponentPropTypes]: unknown;
};

const DocumentTemplateContent = ({
  Repository,
  ResourceGeneratorComponent,
  category,
  editedContents,
  mode,
  existingDocument: propExistingDocument,
}: DocumentTemplateContentProps) => {
  const { state, actions } = usePaperBoard();
  const { getResourceById } = useResourceContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("budget");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isEditor, setIsEditor] = useState(false);
  const [viewMode, setViewMode] = useState<"document" | "uploads" | "print">(
    "document"
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const documentElementRef = useRef<HTMLDivElement>(null);

  const { config } = useStateContext();

  const period = useMemo(() => config("jolt_budget_year"), [config]);

  // PDF Merger hook
  const {
    mergedPdfUrl,
    isLoading: isPdfLoading,
    error: pdfError,
    generateMergedPdf,
    clearPdf,
  } = usePdfMerger(state.existingDocument?.uploads);

  // Initialize useCore hook for workflow actions
  const {
    pass,
    stall,
    process,
    reverse,
    complete,
    cancel,
    appeal,
    escalate,
    canPass,
    canStall,
    canProcess,
    canReverse,
    canComplete,
    canCancel,
    canAppeal,
    canEscalate,
    isLoading: isWorkflowLoading,
    error: workflowError,
    currentTracker: coreCurrentTracker,
  } = useCore(category);

  // Initialize activity logger
  const {
    logDocumentToggle,
    logWorkflowAction,
    logContentAction,
    logTabSwitch,
    logResourceLink,
    logDocumentGenerate,
  } = useActivityLogger();

  // Tab reordering state
  const [tabOrder, setTabOrder] = useState([
    { id: "budget", label: "Budget", icon: "ri-bank-line", isEditor: true },
    {
      id: "uploads",
      label: "Uploads",
      icon: "ri-git-repository-commits-line",
      isEditor: true,
    },
    {
      id: "resource",
      label: "Resource",
      icon: "ri-database-2-line",
      isEditor: true,
    },
    {
      id: "process",
      label: "Process",
      icon: "ri-swap-2-line",
      isEditor: false,
    },
    {
      id: "activities",
      label: "Activities",
      icon: "ri-line-chart-line",
      isEditor: false,
    },
    {
      id: "settings",
      label: "Settings",
      icon: "ri-settings-3-line",
      isEditor: true,
    },
  ]);
  const [draggedTabIndex, setDraggedTabIndex] = useState<number | null>(null);
  const [editingItems, setEditingItems] = useState<Set<string>>(new Set());

  const TemplateHeader = useTemplateHeader(state.template);

  // Ref to prevent infinite loops during sync
  const hasSyncedRef = useRef<number | false>(false);

  // Sync prop existingDocument to global state
  useEffect(() => {
    if (propExistingDocument) {
      // Always sync when prop data changes, regardless of global state
      if (
        !state.existingDocument ||
        state.existingDocument.id !== propExistingDocument.id
      ) {
        actions.setExistingDocument(propExistingDocument);

        // Reset sync flag to force re-sync of all data
        hasSyncedRef.current = false;
      }
    }
  }, [propExistingDocument, state.existingDocument]); // Removed actions from dependencies to prevent re-render loops

  // Reset sync flag when document changes or component unmounts
  useEffect(() => {
    // Reset sync flag when prop document changes
    if (
      propExistingDocument &&
      hasSyncedRef.current !== propExistingDocument.id
    ) {
      hasSyncedRef.current = false;
    }

    // Cleanup function to reset sync flag on unmount
    return () => {
      hasSyncedRef.current = false;
    };
  }, [propExistingDocument]);

  // Sync existing document data with global state when in edit mode
  useEffect(() => {
    // Always reset sync flag if document ID changes
    if (
      state.existingDocument &&
      hasSyncedRef.current !== state.existingDocument.id
    ) {
      hasSyncedRef.current = false;
    }

    // Run sync when existingDocument is available and we haven't synced this document yet
    if (state.existingDocument && !hasSyncedRef.current) {
      setIsSyncing(true);
      hasSyncedRef.current = state.existingDocument.id; // Store document ID instead of just true

      // Sync config state FIRST (highest priority)
      if (state.existingDocument.config) {
        actions.setConfigState(state.existingDocument.config);
      }

      // Sync document title
      if (state.existingDocument.title) {
        actions.setDocumentState({
          ...state.documentState,
          title: state.existingDocument.title,
        } as any);
      }

      // Sync document owner
      if (state.existingDocument.owner) {
        actions.setDocumentOwner({
          value: state.existingDocument.owner.id,
          label: state.existingDocument.owner.name,
        });
      }

      // Sync department owner
      if (state.existingDocument.dept) {
        actions.setDepartmentOwner({
          value: state.existingDocument.department_id || 0,
          label: state.existingDocument.dept,
        });
      }

      // Sync fund - get the correct fund from ResourceContext
      if (
        state.existingDocument.fund_id &&
        state.existingDocument.fund_id > 0
      ) {
        // Get fund from ResourceContext
        const matchingFund = getResourceById(
          "funds",
          state.existingDocument!.fund_id
        );

        if (matchingFund) {
          actions.setFund({
            value: matchingFund.id,
            label: matchingFund?.name ?? "",
          });
        } else if ((state.existingDocument as any)?.fund?.label) {
          // Fallback to existing document fund data
          actions.setFund({
            value: state.existingDocument.fund_id,
            label: (state.existingDocument as any).fund.label,
          });
        } else {
          // Set fund with just the ID if no label is available
          actions.setFund({
            value: state.existingDocument.fund_id,
            label: `Fund ${state.existingDocument.fund_id}`,
          });
        }
      }
      // Sync meta data
      if (state.existingDocument.meta_data) {
        actions.setMetaData(state.existingDocument.meta_data);
      } else {
        // Initialize default meta data if none exist (create mode)
        const defaultMetaData = {
          policy: {
            strict: false,
            scope: "private" as const,
            access_token: "",
            can_override: false,
            clearance_level: null,
            fallback_approver: null,
            for_signed: false,
            days: 30,
            frequency: "days" as const,
          },
          recipients: [],
          actions: [],
          activities: [],
          comments: [],
          settings: {
            priority: "medium" as const,
            accessLevel: "private" as const,
            access_token: "",
            lock: false,
            confidentiality: "general" as const,
          },
        };

        actions.setMetaData(defaultMetaData);
      }

      // Sync preferences
      if (state.existingDocument.preferences) {
        actions.setPreferences(state.existingDocument.preferences);
      } else {
        // Initialize default preferences if none exist (create mode)
        const defaultPreferences = {
          priority: "medium" as const,
          accessLevel: "private" as const,
          access_token: "",
          lock: false,
          confidentiality: "general" as const,
        };

        actions.setPreferences(defaultPreferences);
      }

      // Sync watchers
      if (state.existingDocument.watchers) {
        actions.setWatchers(state.existingDocument.watchers);
      } else {
        // Initialize empty watchers array if none exist (create mode)
        actions.setWatchers([]);
      }

      // Sync requirements - convert to the expected format and sync is_present status
      if (state.existingDocument.uploaded_requirements) {
        // First, convert uploaded requirements to the expected format
        const convertedRequirements =
          state.existingDocument.uploaded_requirements.map((req) => ({
            id: req.id,
            name: req.name,
            description: req.description,
            priority: req.priority,
            is_required: true, // Default to required
            is_present: true, // Default to present since they're uploaded
            severity:
              req.priority === "high"
                ? "critical"
                : req.priority === "medium"
                ? "warning"
                : "info",
          }));

        // Now update existing requirements to mark uploaded ones as present
        if (
          state.requirements &&
          Array.isArray(state.requirements) &&
          state.requirements.length > 0
        ) {
          const updatedRequirements = state.requirements.map((req) => {
            // Check if this requirement exists in uploaded_requirements
            const isUploaded =
              state.existingDocument!.uploaded_requirements!.some(
                (uploadedReq) => uploadedReq.id === req.id
              );

            return {
              ...req,
              is_present: isUploaded || req.is_present, // Keep existing is_present if true, otherwise set based on upload status
            };
          });

          // Set the updated requirements with proper is_present status
          actions.setRequirements(updatedRequirements);
        } else {
          // If no existing requirements, just set the converted ones
          actions.setRequirements(convertedRequirements);
        }
      } else {
        // Initialize empty requirements array if none exist (create mode)
        actions.setRequirements([]);
      }

      // Sync document contents/body
      if (state.existingDocument.contents) {
        actions.setBody(state.existingDocument.contents);
      }

      // Sync pointer
      if (state.existingDocument.pointer) {
        actions.setCurrentPointer(state.existingDocument.pointer);
      }

      // Sync threads from existing document
      if (
        state.existingDocument.threads &&
        Array.isArray(state.existingDocument.threads)
      ) {
        // Only update if threads exist and are different from current state
        const existingThreads = state.threads || [];
        const documentThreads = state.existingDocument.threads;

        // Check if threads are different (by comparing length and IDs)
        const threadsAreDifferent =
          existingThreads.length !== documentThreads.length ||
          existingThreads.some((existingThread, index) => {
            const docThread = documentThreads[index];
            return (
              !docThread || existingThread.identifier !== docThread.identifier
            );
          });

        if (threadsAreDifferent) {
          actions.setThreads(documentThreads);
        }
      } else {
        // Initialize empty threads array if none exist
        if (!state.threads || state.threads.length === 0) {
          actions.setThreads([]);
        }
      }

      // Sync uploads - convert data URLs back to File objects
      if (
        state.existingDocument.uploads &&
        state.existingDocument.uploads.length > 0
      ) {
        // Convert UploadResponseData[] to { id: string; file: File }[]
        const convertUploadsToFiles = async () => {
          try {
            if (!state.existingDocument?.uploads) return;

            const filePromises = state.existingDocument.uploads.map(
              async (upload) => {
                // Extract file information from upload
                const fileName = upload.name || `file_${upload.id}`;
                const fileExtension = upload.extension || "";
                const mimeType = upload.mime_type || "application/octet-stream";

                // Convert data URL to Blob to preserve actual file data
                let file: File;

                if (upload.file_path && upload.file_path.startsWith("data:")) {
                  try {
                    // Convert data URL to Blob
                    const response = await fetch(upload.file_path);
                    const blob = await response.blob();

                    // Create File with actual data and correct properties
                    file = new File([blob], fileName, {
                      type: mimeType,
                      lastModified: new Date().getTime(),
                    });
                  } catch (fetchError) {
                    // Fallback to placeholder file if data URL conversion fails
                    const fileBlob = new Blob([""], { type: mimeType });
                    file = new File([fileBlob], fileName, { type: mimeType });
                  }
                } else {
                  const fileBlob = new Blob([""], { type: mimeType });
                  file = new File([fileBlob], fileName, { type: mimeType });
                }

                // Add custom properties to maintain upload information
                (file as any).uploadId = upload.id;
                (file as any).originalPath = upload.path;
                (file as any).originalSize = upload.size;
                (file as any).originalMimeType = upload.mime_type;
                (file as any).originalExtension = upload.extension;
                (file as any).isExistingUpload = true;

                // Return the expected format: { id: string; file: File }
                return {
                  id: upload.id.toString(),
                  file: file,
                };
              }
            );

            const uploadObjects = await Promise.all(filePromises);
            actions.setUploads(uploadObjects);
          } catch (error) {
            // Error converting uploads to files
          }
        };

        convertUploadsToFiles();
      }
    } else if (state.existingDocument && hasSyncedRef.current) {
      // Document exists but we've already synced - verify all critical state is set
      let needsResync = false;

      if (state.existingDocument.config && !state.configState) {
        needsResync = true;
      }

      if (state.existingDocument.title && !state.documentState?.title) {
        needsResync = true;
      }

      if (state.existingDocument.owner && !state.document_owner) {
        needsResync = true;
      }

      if (needsResync) {
        hasSyncedRef.current = false;
      }
    }
  }, [
    state.existingDocument,
    mode,
    actions,
    state.configState,
    state.documentState?.title,
    state.document_owner,
    propExistingDocument,
  ]);

  // Set syncing to false after sync operations complete
  useEffect(() => {
    if (hasSyncedRef.current && isSyncing) {
      setIsSyncing(false);
    }
  }, [hasSyncedRef.current, isSyncing]);

  // Effect to sync requirements whenever they become available
  useEffect(() => {
    if (
      state.existingDocument?.uploaded_requirements &&
      state.requirements &&
      Array.isArray(state.requirements) &&
      state.requirements.length > 0
    ) {
      // Check if requirements actually need updating
      const needsUpdate = state.requirements.some((req) => {
        const isUploaded = state.existingDocument!.uploaded_requirements!.some(
          (uploadedReq) => uploadedReq.id === req.id
        );
        return isUploaded !== req.is_present;
      });

      if (needsUpdate) {
        const updatedRequirements = state.requirements.map((req) => {
          const isUploaded =
            state.existingDocument!.uploaded_requirements!.some(
              (uploadedReq) => uploadedReq.id === req.id
            );

          return {
            ...req,
            is_present: isUploaded || req.is_present,
          };
        });

        actions.setRequirements(updatedRequirements);
      }
    }
  }, [
    state.requirements,
    state.existingDocument?.uploaded_requirements,
    // Removed actions from dependencies to prevent re-render loops
  ]);

  // Effect to sync threads whenever they become available from existing document
  useEffect(() => {
    if (
      state.existingDocument?.threads &&
      Array.isArray(state.existingDocument.threads)
    ) {
      // Check if threads actually need updating
      const existingThreads = state.threads || [];
      const documentThreads = state.existingDocument.threads;

      // Only sync if the document threads are more recent or if we have no threads at all
      // This prevents overriding user changes that are newer than the document data
      const shouldSync =
        existingThreads.length === 0 || // No threads in state, sync from document
        documentThreads.length > existingThreads.length || // Document has more threads
        documentThreads.some((docThread) => {
          // Check if document has threads that don't exist in state
          return !existingThreads.some(
            (existingThread) =>
              existingThread.identifier === docThread.identifier
          );
        });

      if (shouldSync) {
        // Merge document threads with existing state threads, giving priority to state threads
        const mergedThreads = [...existingThreads];

        documentThreads.forEach((docThread) => {
          const existingIndex = mergedThreads.findIndex(
            (existingThread) =>
              existingThread.identifier === docThread.identifier
          );

          if (existingIndex === -1) {
            // Thread doesn't exist in state, add it
            mergedThreads.push(docThread);
          } else {
            // Thread exists, but check if document has more conversations
            const existingThread = mergedThreads[existingIndex];
            if (
              docThread.conversations.length >
              existingThread.conversations.length
            ) {
              // Document has more conversations, update the thread
              mergedThreads[existingIndex] = docThread;
            }
            // Otherwise, keep the existing thread (user changes take priority)
          }
        });

        actions.setThreads(mergedThreads);
      }
    } else if (
      state.existingDocument &&
      (!state.existingDocument.threads ||
        state.existingDocument.threads.length === 0)
    ) {
      // Document exists but has no threads - only clear if we have no threads at all
      if (state.threads && state.threads.length === 0) {
        actions.setThreads([]);
      }
    }
  }, [state.existingDocument?.threads]); // Removed actions from dependencies to prevent re-render loops

  // Sample blocks for demonstration when state.blocks is empty
  const sampleBlocks = [
    { id: "1", title: "Header", icon: "ri-heading" },
    { id: "2", title: "Text", icon: "ri-text" },
    { id: "3", title: "Table", icon: "ri-table-line" },
    { id: "4", title: "List", icon: "ri-list-check" },
    { id: "5", title: "Image", icon: "ri-image-line" },
    { id: "6", title: "Chart", icon: "ri-bar-chart-line" },
  ];

  const displayBlocks =
    state.blocks && state.blocks.length > 0 ? state.blocks : sampleBlocks;

  const handleTabChange = useCallback(
    (tabName: string) => {
      setActiveTab(tabName);
      logTabSwitch(tabName);
    },
    [logTabSwitch]
  );

  // Tab reordering handlers - memoized to prevent re-renders
  const handleTabDragStart = useCallback(
    (e: React.DragEvent, index: number) => {
      setDraggedTabIndex(index);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", `tab-${index}`);
    },
    []
  );

  const handleTabDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleTabDragEnter = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      if (draggedTabIndex !== null && draggedTabIndex !== index) {
        const target = e.currentTarget as HTMLElement;
        target.classList.add("tab-drag-over");
      }
    },
    [draggedTabIndex]
  );

  const handleTabDragLeave = useCallback((e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.classList.remove("tab-drag-over");
  }, []);

  const handleTabDrop = useCallback(
    (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault();

      if (draggedTabIndex !== null && draggedTabIndex !== dropIndex) {
        const newTabOrder = [...tabOrder];
        const [draggedTab] = newTabOrder.splice(draggedTabIndex, 1);
        newTabOrder.splice(dropIndex, 0, draggedTab);

        setTabOrder(newTabOrder);

        // Update active tab if the dragged tab was active
        if (activeTab === draggedTab.id) {
          setActiveTab(draggedTab.id);
        }
      }

      // Remove drag-over classes
      document.querySelectorAll(".tab__item").forEach((tab) => {
        tab.classList.remove("tab-drag-over");
      });

      setDraggedTabIndex(null);
    },
    [draggedTabIndex, tabOrder, activeTab]
  );

  // Drag and Drop handlers for body items (reordering) - memoized
  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", `body-item-${index}`);
  }, []);

  // Drag and Drop handlers for toolbar blocks (adding new items) - memoized
  const handleBlockDragStart = useCallback((e: React.DragEvent, block: any) => {
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("application/json", JSON.stringify(block));
    e.dataTransfer.setData("text/plain", "toolbar-block");
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const dragType = e.dataTransfer.types.includes("application/json")
      ? "copy"
      : "move";
    e.dataTransfer.dropEffect = dragType;
  }, []);

  const handleDragEnter = useCallback(
    (e: React.DragEvent, index?: number) => {
      e.preventDefault();
      const dragType = e.dataTransfer.types.includes("application/json");

      if (dragType) {
        // Toolbar block being dragged - highlight sheet content
        const sheetContent =
          e.currentTarget.closest(".sheet__content") || e.currentTarget;
        sheetContent.classList.add("drag-over");
      } else if (
        draggedIndex !== null &&
        index !== undefined &&
        draggedIndex !== index
      ) {
        // Body item being reordered - highlight specific item
        const target = e.currentTarget as HTMLElement;
        target.classList.add("drag-over");
      }
    },
    [draggedIndex]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent, dropIndex?: number) => {
      e.preventDefault();

      const dragType = e.dataTransfer.getData("text/plain");

      if (dragType === "toolbar-block") {
        // Handle dropping a toolbar block
        try {
          const blockData = JSON.parse(
            e.dataTransfer.getData("application/json")
          );
          const newContentBlock: ContentBlock = {
            id: crypto.randomUUID(),
            type: blockData.data_type,
            block: blockData,
            order: state.body.length + 1,
            content: null,
            comments: [],
          };

          const newBody = [...state.body];
          if (dropIndex !== undefined) {
            // Insert at specific position
            newBody.splice(dropIndex, 0, newContentBlock);
            // Update order for all items
            newBody.forEach((item, index) => {
              item.order = index + 1;
            });
          } else {
            // Add at the end
            newBody.push(newContentBlock);
          }

          actions.setBody(newBody);

          // Log the content addition
          logContentAction(
            "content_add",
            blockData.data_type,
            newContentBlock.id
          );
        } catch (error) {
          // Error parsing block data
        }
      } else if (
        dragType.startsWith("body-item-") &&
        draggedIndex !== null &&
        dropIndex !== undefined &&
        draggedIndex !== dropIndex
      ) {
        // Handle reordering body items
        const newBody = [...state.body];
        const [draggedItem] = newBody.splice(draggedIndex, 1);
        newBody.splice(dropIndex, 0, draggedItem);

        // Update order for all items
        newBody.forEach((item, index) => {
          item.order = index + 1;
        });

        actions.setBody(newBody);

        // Log the content reordering
        logContentAction("content_reorder", draggedItem.type, draggedItem.id);
      }

      // Remove drag-over class from all items
      document.querySelectorAll(".body__item").forEach((item) => {
        item.classList.remove("drag-over");
      });
      document.querySelectorAll(".sheet__content").forEach((item) => {
        item.classList.remove("drag-over");
      });

      setDraggedIndex(null);
    },
    [draggedIndex, state.body, actions, logContentAction]
  );

  const handleManageItem = useCallback((itemId: string) => {
    setEditingItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, []);

  const handleRemoveItem = useCallback(
    (itemId: string) => {
      const itemToRemove = state.body.find((item) => item.id === itemId);
      const newBody = state.body.filter((item) => item.id !== itemId);
      actions.setBody(newBody);

      // Log the removal
      if (itemToRemove) {
        logContentAction("content_remove", itemToRemove.type, itemId);
      }
    },
    [state.body, actions, logContentAction]
  );

  // Handle workflow actions - memoized
  const handleWorkflowAction = useCallback(
    async (action: DocumentActionResponseData) => {
      try {
        switch (action.action_status) {
          case "passed":
            if (canPass) {
              await pass(action.id, undefined, action.draft_status);
              logWorkflowAction("passed");
            }
            break;
          case "stalled":
            if (canStall) {
              await stall(action.id, undefined, action.draft_status);
              logWorkflowAction("stalled");
            }
            break;
          case "processing":
            if (canProcess) {
              await process(action.id, undefined, action.draft_status);
              logWorkflowAction("processing");
            }
            break;
          case "reversed":
            if (canReverse) {
              await reverse(action.id, undefined, action.draft_status);
              logWorkflowAction("reversed");
            }
            break;
          case "complete":
            if (canComplete) {
              await complete(action.id, undefined, action.draft_status);
              logWorkflowAction("complete");
            }
            break;
          case "cancelled":
            if (canCancel) {
              await cancel(action.id, undefined, action.draft_status);
              logWorkflowAction("cancelled");
            }
            break;
          case "appeal":
            if (canAppeal) {
              await appeal(action.id, undefined, action.draft_status);
              logWorkflowAction("appeal");
            }
            break;
          case "escalate":
            if (canEscalate) {
              await escalate(action.id, undefined, action.draft_status);
              logWorkflowAction("escalate");
            }
            break;
          default:
          // Unknown action status
        }
      } catch (error) {
        // Workflow action failed
      }
    },
    [
      canPass,
      canStall,
      canProcess,
      canReverse,
      canComplete,
      canCancel,
      canAppeal,
      canEscalate,
      pass,
      stall,
      process,
      reverse,
      complete,
      cancel,
      appeal,
      escalate,
      logWorkflowAction,
    ]
  );

  const handleAddResourceLink = useCallback(
    (contentBlock: ContentBlock) => {
      // Check if the content block is already in resourceLinks
      const isAlreadyLinked = state.resourceLinks?.some(
        (link) => link.id === contentBlock.id
      );

      if (isAlreadyLinked) {
        // If already linked, remove it
        const updatedResourceLinks =
          state.resourceLinks?.filter((link) => link.id !== contentBlock.id) ||
          [];
        actions.setResourceLinks(updatedResourceLinks);
        logResourceLink("unlinked", contentBlock.id);
      } else {
        // If not linked, add it
        const updatedResourceLinks = [
          ...(state.resourceLinks || []),
          contentBlock,
        ];
        actions.setResourceLinks(updatedResourceLinks);
        logResourceLink("linked", contentBlock.id);
      }
    },
    [state.resourceLinks, actions, logResourceLink]
  );

  const handleGenerateDocument = useCallback(async () => {
    // Show progress modal using global function
    if (window.showDocumentProgressModal) {
      window.showDocumentProgressModal(handleDocumentGenerationComplete);
      logDocumentGenerate();
    }
  }, [logDocumentGenerate]);

  // console.log(state.existingDocument);

  const handleDocumentGenerationComplete = useCallback(async () => {
    try {
      // Convert File objects to data URLs
      const uploadDataUrls = await Promise.all(
        state.uploads.map(async (file) => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
              resolve(reader.result as string);
            };
            reader.readAsDataURL(file);
          });
        })
      );

      // Use the already transformed trackers from global state
      const transformedTrackers = state.trackers;

      const paperTitleState = state.body.find(
        (link) => link.type === "paper_title"
      );

      // Generate Threads from the transformed trackers
      const conversations: ThreadResponseData[] = transformedTrackers.map(
        (tracker) => {
          return {
            pointer_identifier: tracker.identifier,
            identifier: `thread_${tracker.user_id}_${
              state.loggedInUser?.id ?? 0
            }_${tracker.identifier}_${Date.now()}`,
            thread_owner_id: tracker.user_id,
            recipient_id: state.loggedInUser?.id ?? 0,
            category: "question" as PointerActivityTypesProps,
            conversations: [],
            priority: "medium",
            status: "pending",
            state: "open",
            created_at: new Date().toISOString(),
            id: Date.now(),
          };
        }
      );

      const document = {
        title:
          (paperTitleState?.content?.paper_title as PaperTitleContent)?.title ??
          state.documentState?.title,
        date: moment().format("DD/MM/YYYY"),
        content: state.body,
        config: state.configState,
        template: state.template,
        category: category,
        mode: state.existingDocument ? "update" : "store",
        existing_document_id: state.existingDocument?.id ?? 0,
        existing_resource_id: state.existingDocument?.documentable_id ?? 0,
        service: category?.service,
        trackers: transformedTrackers,
        user_id: state.configState?.from?.user_id ?? state.loggedInUser?.id,
        document_owner: state.document_owner ?? {
          value: state.configState?.from?.user_id,
          label: "Staff",
        },
        department_owner: state.department_owner,
        fund: state.fund,
        meta_data: state.metaData,
        preferences: state.preferences,
        uploads: uploadDataUrls,
        watchers: state.watchers,
        loggedInUser: {
          id: state.loggedInUser?.id,
          name: state.loggedInUser?.name,
          email: state.loggedInUser?.email,
        },
        requirements: state.requirements.filter(
          (requirement) => requirement.is_present
        ),
        approval_memo: state.approval_memo,
        budget_year: period,
        conversations,
      };

      // Ensure preferences are populated before submission
      if (!document.preferences) {
        const defaultPreferences = {
          priority: "medium" as const,
          accessLevel: "private" as const,
          access_token: "",
          lock: false,
          confidentiality: "general" as const,
        };
        document.preferences = defaultPreferences;
      }

      // Submit to backend
      const response = await Repository.store("generate/document", document);

      if (response.code === 200) {
        Alert.success(
          "Document Generated",
          "Document has been successfully generated and submitted!"
        );
        navigate("/desk/folders");
      } else {
        Alert.error(
          "Generation Failed",
          "There was an error generating your document. Please try again."
        );
      }
    } catch (error) {
      // Error generating document
      Alert.error(
        "Generation Failed",
        "An unexpected error occurred. Please try again."
      );
    }
  }, [
    state.uploads,
    state.trackers,
    state.body,
    state.documentState,
    state.configState,
    state.template,
    category,
    state.existingDocument,
    state.fund,
    state.metaData,
    state.watchers,
    state.loggedInUser,
    state.requirements,
    state.approval_memo,
    state.threads,
    period,
    actions,
    navigate,
  ]);

  // Transform configState to CategoryProgressTrackerProps[] and update global trackers
  const transformedTrackers: CategoryProgressTrackerProps[] = useMemo(() => {
    if (!state.configState) {
      return state.trackers; // Fallback to category trackers if no configState
    }

    const trackers: CategoryProgressTrackerProps[] = [];

    // Add from stage if it exists
    if (state.configState.from) {
      trackers.push({
        ...state.configState.from,
        order: 1,
        flow_type: "from",
      });
    }

    // Add through stage if it exists
    if (state.configState.through) {
      trackers.push({
        ...state.configState.through,
        order: trackers.length + 1,
        flow_type: "through",
      });
    }

    // Add to stage if it exists
    if (state.configState.to) {
      trackers.push({
        ...state.configState.to,
        order: trackers.length + 1,
        flow_type: "to",
      });
    }

    return trackers;
  }, [state.configState, state.trackers]);

  // Update global trackers when transformedTrackers change
  // Use a ref to track the last updated value and prevent infinite loops
  const lastTrackerUpdateRef = useRef<string>("");
  useEffect(() => {
    const transformedStr = JSON.stringify(transformedTrackers);
    const stateStr = JSON.stringify(state.trackers);

    if (
      transformedTrackers.length > 0 &&
      transformedStr !== stateStr &&
      transformedStr !== lastTrackerUpdateRef.current
    ) {
      lastTrackerUpdateRef.current = transformedStr;
      actions.setTrackers(transformedTrackers);
    }
  }, [transformedTrackers, state.trackers]); // Removed actions from dependencies to prevent re-render loops

  const currentTracker: CategoryProgressTrackerProps | null = useMemo(() => {
    if (state.currentPointer) {
      return (
        transformedTrackers.find(
          (tracker) => tracker.identifier === state.currentPointer
        ) ?? null
      );
    }
    return null;
  }, [transformedTrackers, state.currentPointer]);

  const currentPage: SelectedActionsProps[] = useMemo(() => {
    const documentActions = state.metaData?.actions;
    if (!currentTracker || !documentActions) {
      return [];
    }
    return documentActions.filter(
      (action) => action.identifier === currentTracker.identifier
    );
  }, [currentTracker, state.metaData?.actions]);

  const isUserAuthorized = currentTracker?.user_id === state.loggedInUser?.id;

  // Check if user has signed the document (for signature type blocks)
  const hasUserSigned = useMemo(() => {
    // Find signature type blocks in state.body
    const signatureBlock = state.body.find((item) => item.type === "signature");

    if (signatureBlock && signatureBlock.content?.signature) {
      // Access the signatures array from the nested structure
      const signatures = (signatureBlock.content.signature as any)
        ?.signatures as SignatureResponseData[];

      if (
        !signatures ||
        !Array.isArray(signatures) ||
        signatures.length === 0
      ) {
        return false;
      }

      // Find signature for current user
      const userSignature = signatures.find(
        (sig) => sig.user_id === state.loggedInUser?.id
      );

      // If user signature exists but is null/empty, they haven't signed
      if (
        userSignature &&
        (!userSignature.signature || userSignature.signature.trim() === "")
      ) {
        return false;
      }

      return true;
    }

    return true; // Default to true if no signature blocks or user has signed
  }, [state.body, state.loggedInUser?.id]);

  useEffect(() => {
    if (mode === "update") {
      setIsEditor(false); // Start in preview mode for existing documents
    } else if (mode === "store") {
      setIsEditor(true); // Start in editor mode for new documents
    }
  }, [mode]);

  // Generate PDF when switching to uploads view
  useEffect(() => {
    if (
      viewMode === "uploads" &&
      state.existingDocument?.uploads &&
      state.existingDocument.uploads.length > 0
    ) {
      generateMergedPdf();
    } else if (viewMode !== "uploads") {
      clearPdf();
    }
  }, [viewMode, state.existingDocument?.uploads]);

  return (
    <div className="document__template__content">
      {/* Sync Loading Overlay */}
      {isSyncing && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              className="skeleton-line"
              style={{
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                animation: "skeleton-loading 1s infinite",
              }}
            ></div>
            <span>Syncing document data...</span>
          </div>
        </div>
      )}
      <div className="row">
        <div className="col-md-7 mb-3">
          <div className="document__template__paper">
            {/* Paper Header */}
            <div className="document__template__paper__header flex align center between">
              {/* Switch isEditor */}
              {(mode === "update" &&
                !state.existingDocument?.is_completed &&
                (state.loggedInUser?.id === state.existingDocument?.user_id ||
                  state.loggedInUser?.id ===
                    state.existingDocument?.created_by)) ||
              mode === "store" ? (
                <div className="switch__editor">
                  <input
                    type="checkbox"
                    id="editor-switch"
                    checked={isEditor}
                    onChange={() => {
                      setIsEditor(!isEditor);
                      logDocumentToggle(!isEditor);
                    }}
                  />
                  <label htmlFor="editor-switch">
                    {isEditor ? "Editor" : "Preview"}
                  </label>
                </div>
              ) : null}

              <div className="document__template__paper__header__actions flex align gap-md">
                {/* Workflow Loading Indicator */}
                {isWorkflowLoading && (
                  <div className="workflow__loading flex align center gap-sm">
                    <i className="ri-loader-4-line animate-spin"></i>
                    <span>Processing...</span>
                  </div>
                )}

                {state.existingDocument?.is_completed == true && (
                  <div
                    style={{
                      padding: "0.2rem .8rem",
                    }}
                    className="workflow__loading flex align center gap-sm"
                  >
                    <i className="ri-bubble-chart-line"></i>
                    <span>{state.existingDocument?.status}</span>
                  </div>
                )}

                {/* Workflow Error Display */}
                {workflowError && (
                  <div className="workflow__error flex align center gap-sm">
                    <i className="ri-error-warning-line text-danger"></i>
                    <span className="text-danger">{workflowError}</span>
                  </div>
                )}

                {/* Workflow Actions - only show in update mode */}
                {mode === "update" &&
                  currentPage.map((page, idx) => {
                    // Determine if this action is disabled based on workflow state
                    const isActionDisabled =
                      isEditor ||
                      state.existingDocument?.is_completed ||
                      isWorkflowLoading ||
                      !isUserAuthorized ||
                      // Disable passed and complete actions if signature is required
                      (currentTracker?.should_be_signed === "yes" &&
                        !hasUserSigned &&
                        (page.action.action_status === "passed" ||
                          page.action.action_status === "complete")) ||
                      (page.action.action_status === "passed" && !canPass) ||
                      (page.action.action_status === "complete" &&
                        !canComplete) ||
                      (page.action.action_status === "stalled" && !canStall) ||
                      (page.action.action_status === "processing" &&
                        !canProcess) ||
                      (page.action.action_status === "reversed" &&
                        !canReverse) ||
                      (page.action.action_status === "cancelled" &&
                        !canCancel) ||
                      (page.action.action_status === "appeal" && !canAppeal) ||
                      (page.action.action_status === "escalate" &&
                        !canEscalate);

                    return (
                      <Button
                        key={idx}
                        label={page.action.button_text}
                        icon={page.action.icon}
                        handleClick={() => handleWorkflowAction(page.action)}
                        variant={page.action.variant}
                        size="sm"
                        isDisabled={isActionDisabled}
                      />
                    );
                  })}
              </div>
            </div>

            {mode === "update" && (
              <div
                style={{
                  padding: "0 1.8rem",
                }}
                className="page__flipped"
              >
                {/* Page Flipped Content */}
                <div className={`page__flipped__toggler state-${viewMode}`}>
                  <span
                    className="toggle-label left"
                    onClick={() => setViewMode("document")}
                  >
                    <i className="ri-file-text-line"></i>
                    <span>Document</span>
                  </span>
                  <span
                    className="toggle-label center"
                    onClick={() => setViewMode("uploads")}
                  >
                    <i className="ri-upload-cloud-line"></i>
                    <span>Uploads</span>
                  </span>
                </div>
              </div>
            )}

            {/* Paper Panel */}
            {isEditor && (
              <div className="document__template__paper__panel">
                {/* Toolbar with blocks */}
                <div className="paper__toolbar">
                  <div className="toolbar__blocks">
                    {displayBlocks && displayBlocks.length > 0 ? (
                      displayBlocks.map((block) => (
                        <div
                          key={block.id}
                          className="toolbar__block"
                          draggable
                          onDragStart={(e) => handleBlockDragStart(e, block)}
                        >
                          <div className="block__icon">
                            <i className={block.icon}></i>
                          </div>
                          <div className="block__name">{block.title}</div>
                        </div>
                      ))
                    ) : (
                      <div className="toolbar__empty">
                        <i className="ri-layout-grid-line"></i>
                        <span>No blocks available</span>
                      </div>
                    )}
                  </div>
                  <div className="toolbar__actions">
                    <button
                      className="generate__document__btn"
                      onClick={handleGenerateDocument}
                    >
                      <i
                        className={
                          state.existingDocument
                            ? "ri-database-2-line"
                            : "ri-store-line"
                        }
                      ></i>
                      <span>
                        {state.existingDocument ? "Update" : "Generate"}{" "}
                        Document
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Always render document element for snapshot, but hide when not in document mode */}
            <div
              className="document__template__paper__sheet"
              ref={documentElementRef}
              style={{
                display: viewMode === "document" ? "flex" : "none",
                position: viewMode !== "document" ? "absolute" : "relative",
                left: viewMode !== "document" ? "-9999px" : "auto",
              }}
            >
              {/* A4 Paper Sheet Area */}
              <A4Sheet
                state={state}
                actions={actions}
                currentPageActions={currentPage}
                handleDragStart={handleDragStart}
                handleDragOver={handleDragOver}
                handleDrop={handleDrop}
                handleDragEnter={handleDragEnter}
                handleAddResourceLink={handleAddResourceLink}
                handleManageItem={handleManageItem}
                handleRemoveItem={handleRemoveItem}
                editingItems={editingItems}
                TemplateHeader={TemplateHeader}
                currentTracker={currentTracker}
                isEditor={isEditor}
              />
            </div>

            {/* Render current view */}
            {viewMode === "uploads" && (
              <div className="uploaded__files" style={{ width: 838 }}>
                <PdfViewer
                  pdfUrl={mergedPdfUrl}
                  isLoading={isPdfLoading}
                  error={pdfError}
                  onGeneratePdf={generateMergedPdf}
                  className="uploaded-files-pdf-viewer"
                />
              </div>
            )}
          </div>
        </div>
        <div className="col-md-5 mb-3">
          <div className="document__template__configuration">
            {/* Configuration Tabs */}
            <div className="configuration__tabs">
              <div className="tabs__header">
                {tabOrder.map((tab, index) => (
                  <div
                    key={tab.id}
                    className={`tab__item ${
                      activeTab === tab.id ? "active" : ""
                    }`}
                    data-tab={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    draggable
                    onDragStart={(e) => handleTabDragStart(e, index)}
                    onDragOver={(e) => handleTabDragOver(e)}
                    onDragEnter={(e) => handleTabDragEnter(e, index)}
                    onDragLeave={handleTabDragLeave}
                    onDrop={(e) => handleTabDrop(e, index)}
                    style={{
                      display: tab.isEditor === isEditor ? "flex" : "none",
                    }}
                  >
                    <i className={tab.icon}></i>
                    <span>{tab.label}</span>
                  </div>
                ))}
              </div>
              <div className="tabs__content">
                {tabOrder.map((tab) => (
                  <div
                    key={tab.id}
                    className={`tab__panel ${
                      activeTab === tab.id ? "active" : ""
                    }`}
                    data-tab={tab.id}
                  >
                    <div className="panel__content">
                      <Suspense
                        fallback={
                          <div className="tab__loading">
                            <i className="ri-loader-4-line animate-spin"></i>
                            <span>Loading tab...</span>
                          </div>
                        }
                      >
                        {tab.id === "budget" && (
                          <BudgetGeneratorTab category={category} />
                        )}
                        {tab.id === "uploads" && (
                          <UploadsGeneratorTab category={category} />
                        )}
                        {tab.id === "resource" && (
                          <ResourceGeneratorTab category={category} />
                        )}
                        {tab.id === "settings" && (
                          <SettingsGeneratorTab category={category} />
                        )}
                        {tab.id === "activities" && (
                          <ActivitiesGeneratorTab category={category} />
                        )}
                        {tab.id === "process" && (
                          <ProcessGeneratorTab category={category} />
                        )}
                      </Suspense>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LinkedIn-style Messaging Component */}
      <DocumentMessaging category={category} />
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default React.memo(DocumentTemplateContent, (prevProps, nextProps) => {
  // Only re-render if these critical props change
  return (
    prevProps.mode === nextProps.mode &&
    prevProps.existingDocument?.id === nextProps.existingDocument?.id &&
    prevProps.category?.id === nextProps.category?.id &&
    prevProps.editedContents.length === nextProps.editedContents.length
  );
});
