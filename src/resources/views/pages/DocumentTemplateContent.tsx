import { BaseRepository } from "@/app/Repositories/BaseRepository";
import {
  DocumentCategoryResponseData,
  CategoryProgressTrackerProps,
} from "@/app/Repositories/DocumentCategory/data";
import React, { useState } from "react";
import { ContextType, usePaperBoard } from "app/Context/PaperBoardContext";
import { useAuth } from "app/Context/AuthContext";
import { ContentBlock } from "@/resources/views/crud/DocumentTemplateBuilder";
import { useTemplateHeader } from "app/Hooks/useTemplateHeader";
import { ProcessFlowConfigProps } from "../crud/DocumentWorkflow";
import moment from "moment";
import InlineContentCard from "../components/ContentCards/InlineContentCard";
import {
  BudgetGeneratorTab,
  UploadsGeneratorTab,
  ResourceGeneratorTab,
  CommentsGeneratorTab,
  SettingsGeneratorTab,
} from "../components/DocumentGeneratorTab";
import organizationLogo from "../../assets/images/logo.png";

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
}: DocumentTemplateContentProps) => {
  const { state, actions } = usePaperBoard();
  const [activeTab, setActiveTab] = useState("budget");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Tab reordering state
  const [tabOrder, setTabOrder] = useState([
    { id: "budget", label: "Budget", icon: "ri-bank-line" },
    { id: "uploads", label: "Uploads", icon: "ri-git-repository-commits-line" },
    { id: "resource", label: "Resource", icon: "ri-database-2-line" },
    { id: "comments", label: "Comments", icon: "ri-message-2-line" },
    { id: "settings", label: "Settings", icon: "ri-settings-3-line" },
  ]);
  const [draggedTabIndex, setDraggedTabIndex] = useState<number | null>(null);
  const [editingItems, setEditingItems] = useState<Set<string>>(new Set());

  const TemplateHeader = useTemplateHeader(state.template);

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

    const document = {
      title: state.documentState?.title,
      date: moment().format("DD/MM/YYYY"),
      content: state.body,
      config: state.configState,
      template: state.template,
      category: category,
      mode: mode,
      service: category?.service,
      trackers: transformedTrackers, // Use transformed configState instead of state.trackers
      document_owner: state.document_owner,
      department_owner: state.department_owner,
      fund: state.fund,
      meta_data: state.metaData,
      preferences: state.preferences,
      uploads: uploadDataUrls, // Now contains data URLs instead of File objects
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
    };

    console.log(document);
  };

  // console.log(state);

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
              <button
                className="generate__document__btn"
                onClick={handleGenerateDocument}
              >
                <i className="ri-file-download-line"></i>
                <span>Generate Document</span>
              </button>
            </div>
          </div>
        </div>
        <div className="document__template__paper__sheet">
          {/* A4 Paper Sheet Area */}
          <div
            className="a4__sheet"
            style={{
              position: "relative",
              boxShadow:
                "0 25px 50px rgba(0, 0, 0, 0.15), 0 10px 20px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
              border: "1px solid rgba(19, 117, 71, 0.1)",
              borderRadius: "12px",
              background:
                "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)",
            }}
          >
            {/* Background logo with fade effect */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `url(${organizationLogo})`,
                backgroundSize: "contain",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                opacity: 0.25,
                filter: "grayscale(0.1)",
                zIndex: 0,
                pointerEvents: "none",
              }}
            />
            {/* Faded background overlay */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(255, 255, 255, 0.85)",
                zIndex: 0,
                pointerEvents: "none",
              }}
            />

            {/* Subtle paper texture overlay */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, rgba(19, 117, 71, 0.03) 1px, transparent 0)",
                backgroundSize: "20px 20px",
                zIndex: 0,
                pointerEvents: "none",
              }}
            />
            {/* Enhanced Header with subtle background */}
            <div
              className="sheet__header"
              style={{
                padding: "45px 32px 32px 32px",
                position: "relative",
                zIndex: 1,
                background:
                  "linear-gradient(180deg, rgba(248, 250, 252, 0.6) 0%, rgba(255, 255, 255, 0.3) 100%)",
              }}
            >
              <TemplateHeader
                configState={state.configState as ProcessFlowConfigProps}
                title={state.documentState?.title ?? null}
                date={moment().format("DD/MM/YYYY")}
                ref={null}
              />
            </div>
            <div
              className="sheet__content"
              style={{ position: "relative", zIndex: 1 }}
              onDragOver={(e) => handleDragOver(e)}
              onDragEnter={(e) => handleDragEnter(e)}
              onDrop={(e) => handleDrop(e)}
            >
              {state.body && state.body.length > 0 ? (
                state.body.map((bodyItem, index) => (
                  <div
                    key={bodyItem.id}
                    className="body__item"
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e)}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnter={(e) => handleDragEnter(e, index)}
                  >
                    <div className="body__item__header">
                      <div className="drag__handle">
                        <i className="ri-drag-move-2-line"></i>
                      </div>
                      <div className="item__title">
                        {bodyItem.block?.title || `Item ${index + 1}`}
                      </div>
                      <div
                        className={`resource__link__button ${
                          state.resourceLinks?.some(
                            (link) => link.id === bodyItem.id
                          )
                            ? "active"
                            : ""
                        }`}
                        onClick={() => handleAddResourceLink(bodyItem)}
                        title={
                          state.resourceLinks?.some(
                            (link) => link.id === bodyItem.id
                          )
                            ? "Remove from resource links"
                            : "Add to resource links"
                        }
                      >
                        <i className="ri-link"></i>
                      </div>
                      <div
                        className="manage__button"
                        onClick={() => handleManageItem(bodyItem.id)}
                        title="Manage item"
                      >
                        <i className="ri-settings-4-line"></i>
                      </div>
                      <div
                        className="remove__button"
                        onClick={() => handleRemoveItem(bodyItem.id)}
                      >
                        <i className="ri-delete-bin-line"></i>
                      </div>
                    </div>
                    <div className="body__item__content">
                      <InlineContentCard
                        item={bodyItem}
                        onClose={() => handleManageItem(bodyItem.id)}
                        isEditing={editingItems.has(bodyItem.id)}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="sheet__placeholder">
                  <i className="ri-file-text-line"></i>
                  <span>A4 Document Sheet</span>
                  <small>Drag and drop content blocks here</small>
                </div>
              )}
            </div>

            {/* Enhanced Footer with subtle background */}
            <div
              style={{
                position: "relative",
                zIndex: 1,
                padding: "32px 32px 45px 32px",
                background:
                  "linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, rgba(248, 250, 252, 0.6) 100%)",
                marginTop: "auto",
              }}
            >
              {/* Footer content */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ fontSize: "12px", color: "rgba(0, 0, 0, 0.6)" }}>
                  <span>Generated on {moment().format("DD/MM/YYYY")}</span>
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "rgba(19, 117, 71, 0.7)",
                    fontWeight: "500",
                  }}
                >
                  <span>NCDMB Document Template</span>
                </div>
                <div style={{ fontSize: "12px", color: "rgba(0, 0, 0, 0.6)" }}>
                  <span>Page 1 of 1</span>
                </div>
              </div>
            </div>
          </div>
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
                  {tab.id === "comments" && (
                    <CommentsGeneratorTab category={category} />
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
