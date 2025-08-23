import { BaseRepository } from "@/app/Repositories/BaseRepository";
import { DocumentCategoryResponseData } from "@/app/Repositories/DocumentCategory/data";
import React, { useState } from "react";
import { ContextType, usePaperBoard } from "app/Context/PaperBoardContext";
import { useAuth } from "app/Context/AuthContext";
import { ContentBlock } from "@/resources/views/crud/DocumentTemplateBuilder";
import { useTemplateHeader } from "app/Hooks/useTemplateHeader";
import { ProcessFlowConfigProps } from "../crud/DocumentWorkflow";
import moment from "moment";

export type DeskComponentPropTypes =
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
  const { staff } = useAuth();
  const [activeTab, setActiveTab] = useState("review");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

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

  // Drag and Drop handlers for body items (reordering)
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", `body-item-${index}`);
  };

  // Drag and Drop handlers for toolbar blocks (adding new items)
  const handleBlockDragStart = (e: React.DragEvent, block: any) => {
    console.log("Block drag start:", block);
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("application/json", JSON.stringify(block));
    e.dataTransfer.setData("text/plain", "toolbar-block");
    console.log("Data transfer set:", e.dataTransfer.types);
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
    console.log("Drop event triggered", {
      dropIndex,
      dataTransfer: e.dataTransfer,
    });

    const dragType = e.dataTransfer.getData("text/plain");
    console.log("Drag type:", dragType);

    if (dragType === "toolbar-block") {
      // Handle dropping a toolbar block
      try {
        const blockData = JSON.parse(
          e.dataTransfer.getData("application/json")
        );
        const newContentBlock: ContentBlock = {
          id: crypto.randomUUID(),
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

  const handleRemoveItem = (itemId: string) => {
    const newBody = state.body.filter((item) => item.id !== itemId);
    actions.setBody(newBody);
  };

  console.log(state);

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
              <button className="generate__document__btn">
                <i className="ri-file-download-line"></i>
                <span>Generate Document</span>
              </button>
            </div>
          </div>
        </div>
        <div className="document__template__paper__sheet">
          {/* A4 Sheet Area */}
          <div className="a4__sheet">
            <div className="sheet__header" style={{ padding: "45px 32px" }}>
              <TemplateHeader
                configState={state.configState as ProcessFlowConfigProps}
                title={state.documentState?.title ?? null}
                date={moment().format("DD/MM/YYYY")}
                ref={null}
              />
            </div>
            <div
              className="sheet__content"
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
                        className="remove__button"
                        onClick={() => handleRemoveItem(bodyItem.id)}
                      >
                        <i className="ri-delete-bin-line"></i>
                      </div>
                    </div>
                    <div className="body__item__content">
                      <div className="item__preview">
                        <i className="ri-file-text-line"></i>
                        <span>
                          Content preview for{" "}
                          {bodyItem.block?.title || "this item"}
                        </span>
                      </div>
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
          </div>
        </div>
      </div>
      <div className="document__template__configuration">
        {/* Configuration Tabs */}
        <div className="configuration__tabs">
          <div className="tabs__header">
            <div
              className={`tab__item ${activeTab === "review" ? "active" : ""}`}
              data-tab="review"
              onClick={() => handleTabChange("review")}
            >
              <i className="ri-eye-line"></i>
              <span>Review</span>
            </div>
            <div
              className={`tab__item ${activeTab === "uploads" ? "active" : ""}`}
              data-tab="uploads"
              onClick={() => handleTabChange("uploads")}
            >
              <i className="ri-upload-line"></i>
              <span>Uploads</span>
            </div>
            <div
              className={`tab__item ${
                activeTab === "settings" ? "active" : ""
              }`}
              data-tab="settings"
              onClick={() => handleTabChange("settings")}
            >
              <i className="ri-settings-3-line"></i>
              <span>Settings</span>
            </div>
            <div
              className={`tab__item ${
                activeTab === "comments" ? "active" : ""
              }`}
              data-tab="comments"
              onClick={() => handleTabChange("comments")}
            >
              <i className="ri-message-2-line"></i>
              <span>Comments</span>
            </div>
            <div
              className={`tab__item ${
                activeTab === "resource" ? "active" : ""
              }`}
              data-tab="resource"
              onClick={() => handleTabChange("resource")}
            >
              <i className="ri-database-2-line"></i>
              <span>Resource</span>
            </div>
          </div>
          <div className="tabs__content">
            <div
              className={`tab__panel ${activeTab === "review" ? "active" : ""}`}
              data-tab="review"
            >
              <div className="panel__content">
                <h4>Review Panel</h4>
                <p>Content for review will appear here</p>
              </div>
            </div>
            <div
              className={`tab__panel ${
                activeTab === "uploads" ? "active" : ""
              }`}
              data-tab="uploads"
            >
              <div className="panel__content">
                <h4>Uploads Panel</h4>
                <p>File uploads will appear here</p>
              </div>
            </div>
            <div
              className={`tab__panel ${
                activeTab === "settings" ? "active" : ""
              }`}
              data-tab="settings"
            >
              <div className="panel__content">
                <h4>Settings Panel</h4>
                <p>Configuration settings will appear here</p>
              </div>
            </div>
            <div
              className={`tab__panel ${
                activeTab === "comments" ? "active" : ""
              }`}
              data-tab="comments"
            >
              <div className="panel__content">
                <h4>Comments Panel</h4>
                <p>Comments and notes will appear here</p>
              </div>
            </div>
            <div
              className={`tab__panel ${
                activeTab === "resource" ? "active" : ""
              }`}
              data-tab="resource"
            >
              <div className="panel__content">
                <h4>Resource Panel</h4>
                <p>Resource information will appear here</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentTemplateContent;
