import { BaseRepository } from "@/app/Repositories/BaseRepository";
import {
  DocumentCategoryResponseData,
  CategoryProgressTrackerProps,
} from "@/app/Repositories/DocumentCategory/data";
import { DocumentResponseData } from "@/app/Repositories/Document/data";
import React, { useState, useEffect, useRef } from "react";
import { ContextType, usePaperBoard } from "app/Context/PaperBoardContext";
import { ContentBlock } from "@/resources/views/crud/DocumentTemplateBuilder";
import { useTemplateHeader } from "app/Hooks/useTemplateHeader";
import moment from "moment";
import {
  BudgetGeneratorTab,
  UploadsGeneratorTab,
  ResourceGeneratorTab,
  SettingsGeneratorTab,
} from "../components/DocumentGeneratorTab";
import A4Sheet from "../components/pages/A4Sheet";
import Alert from "app/Support/Alert";
import { useNavigate } from "react-router-dom";
import { PaperTitleContent } from "../components/ContentCards/PaperTitleContentCard";
import ThreadsGeneratorTab from "../components/DocumentGeneratorTab/ThreadsGeneratorTab";

export type DeskComponentPropTypes =
  | "paper_title"
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
  context: ContextType;
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
  context,
  existingDocument: propExistingDocument,
}: DocumentTemplateContentProps) => {
  const { state, actions } = usePaperBoard();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("budget");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Tab reordering state
  const [tabOrder, setTabOrder] = useState([
    { id: "budget", label: "Budget", icon: "ri-bank-line" },
    { id: "uploads", label: "Uploads", icon: "ri-git-repository-commits-line" },
    { id: "resource", label: "Resource", icon: "ri-database-2-line" },
    { id: "threads", label: "Threads", icon: "ri-chat-3-line" },
    { id: "settings", label: "Settings", icon: "ri-settings-3-line" },
  ]);
  const [draggedTabIndex, setDraggedTabIndex] = useState<number | null>(null);
  const [editingItems, setEditingItems] = useState<Set<string>>(new Set());

  const TemplateHeader = useTemplateHeader(state.template);

  // Ref to prevent infinite loops during sync
  const hasSyncedRef = useRef<number | false>(false);
  const requirementsSyncedRef = useRef(false);

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
  }, [propExistingDocument, state.existingDocument, actions]);

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
            console.error("❌ Error converting uploads to files:", error);
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
    actions,
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
  }, [state.existingDocument?.threads, actions]);

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

  const handleTabChange = (tabName: string) => {
    setActiveTab(tabName);
  };

  // Tab reordering handlers
  const handleTabDragStart = (e: React.DragEvent, index: number) => {
    setDraggedTabIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", `tab-${index}`);
  };

  const handleTabDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleTabDragEnter = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedTabIndex !== null && draggedTabIndex !== index) {
      const target = e.currentTarget as HTMLElement;
      target.classList.add("tab-drag-over");
    }
  };

  const handleTabDragLeave = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.classList.remove("tab-drag-over");
  };

  const handleTabDrop = (e: React.DragEvent, dropIndex: number) => {
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
  };

  // Drag and Drop handlers for body items (reordering)
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", `body-item-${index}`);
  };

  // Drag and Drop handlers for toolbar blocks (adding new items)
  const handleBlockDragStart = (e: React.DragEvent, block: any) => {
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("application/json", JSON.stringify(block));
    e.dataTransfer.setData("text/plain", "toolbar-block");
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    const dragType = e.dataTransfer.types.includes("application/json")
      ? "copy"
      : "move";
    e.dataTransfer.dropEffect = dragType;
  };

  const handleDragEnter = (e: React.DragEvent, index?: number) => {
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
  };

  const handleDrop = (e: React.DragEvent, dropIndex?: number) => {
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
      } catch (error) {
        console.error("Error parsing block data:", error);
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
    }

    // Remove drag-over class from all items
    document.querySelectorAll(".body__item").forEach((item) => {
      item.classList.remove("drag-over");
    });
    document.querySelectorAll(".sheet__content").forEach((item) => {
      item.classList.remove("drag-over");
    });

    setDraggedIndex(null);
  };

  const handleManageItem = (itemId: string) => {
    setEditingItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleRemoveItem = (itemId: string) => {
    const newBody = state.body.filter((item) => item.id !== itemId);
    actions.setBody(newBody);
  };

  const handleAddResourceLink = (contentBlock: ContentBlock) => {
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
    } else {
      // If not linked, add it
      const updatedResourceLinks = [
        ...(state.resourceLinks || []),
        contentBlock,
      ];
      actions.setResourceLinks(updatedResourceLinks);
    }
  };

  const handleGenerateDocument = async () => {
    // Show progress modal using global function
    if (window.showDocumentProgressModal) {
      window.showDocumentProgressModal(handleDocumentGenerationComplete);
    }
  };

  const handleDocumentGenerationComplete = async () => {
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

      // Transform configState to CategoryProgressTrackerProps[] format
      const transformedTrackers: CategoryProgressTrackerProps[] = [];

      if (state.configState) {
        // Add from stage if it exists
        if (state.configState.from) {
          transformedTrackers.push({
            ...state.configState.from,
            order: 1,
          });
        }

        // Add through stage if it exists
        if (state.configState.through) {
          transformedTrackers.push({
            ...state.configState.through,
            order: transformedTrackers.length + 1,
          });
        }

        // Add to stage if it exists
        if (state.configState.to) {
          transformedTrackers.push({
            ...state.configState.to,
            order: transformedTrackers.length + 1,
          });
        }
      }

      const paperTitleState = state.body.find(
        (link) => link.type === "paper_title"
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
        threads: state.threads,
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
      console.error("Error generating document:", error);
      Alert.error(
        "Generation Failed",
        "An unexpected error occurred. Please try again."
      );
    }
  };

  return (
    <div className="document__template__content">
      <div className="document__template__paper">
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
              {state.existingDocument ? (
                <button
                  className="generate__document__btn"
                  onClick={handleGenerateDocument}
                >
                  <i className="ri-database-2-line"></i>
                  <span>Update Document</span>
                </button>
              ) : (
                <button
                  className="generate__document__btn"
                  onClick={handleGenerateDocument}
                >
                  <i className="ri-store-line"></i>
                  <span>Generate Document</span>
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="document__template__paper__sheet">
          {/* A4 Paper Sheet Area */}
          <A4Sheet
            state={state}
            actions={actions}
            handleDragStart={handleDragStart}
            handleDragOver={handleDragOver}
            handleDrop={handleDrop}
            handleDragEnter={handleDragEnter}
            handleAddResourceLink={handleAddResourceLink}
            handleManageItem={handleManageItem}
            handleRemoveItem={handleRemoveItem}
            editingItems={editingItems}
            TemplateHeader={TemplateHeader}
          />
        </div>
      </div>
      <div className="document__template__configuration">
        {/* Configuration Tabs */}
        <div className="configuration__tabs">
          <div className="tabs__header">
            {tabOrder.map((tab, index) => (
              <div
                key={tab.id}
                className={`tab__item ${activeTab === tab.id ? "active" : ""}`}
                data-tab={tab.id}
                onClick={() => handleTabChange(tab.id)}
                draggable
                onDragStart={(e) => handleTabDragStart(e, index)}
                onDragOver={(e) => handleTabDragOver(e)}
                onDragEnter={(e) => handleTabDragEnter(e, index)}
                onDragLeave={handleTabDragLeave}
                onDrop={(e) => handleTabDrop(e, index)}
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
                className={`tab__panel ${activeTab === tab.id ? "active" : ""}`}
                data-tab={tab.id}
              >
                <div className="panel__content">
                  {tab.id === "budget" && (
                    <BudgetGeneratorTab category={category} />
                  )}
                  {tab.id === "uploads" && (
                    <UploadsGeneratorTab category={category} />
                  )}
                  {tab.id === "resource" && (
                    <ResourceGeneratorTab category={category} />
                  )}
                  {tab.id === "threads" && (
                    <ThreadsGeneratorTab category={category} />
                  )}
                  {tab.id === "settings" && (
                    <SettingsGeneratorTab category={category} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentTemplateContent;
