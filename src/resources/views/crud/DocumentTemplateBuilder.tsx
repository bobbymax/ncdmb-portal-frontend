import Editor from "app/Plugins/editor";
import { DocumentCategoryResponseData } from "@/app/Repositories/DocumentCategory/data";
import DocumentCategoryRepository from "@/app/Repositories/DocumentCategory/DocumentCategoryRepository";
import { BuilderComponentProps } from "@/bootstrap";
import React, { useState, useEffect, useCallback } from "react";
import { BlockResponseData } from "@/app/Repositories/Block/data";
import { useNavigate } from "react-router-dom";
import Alert from "app/Support/Alert";
import { toast } from "react-toastify";
import { SheetProps } from "../pages/DocumentTemplateContent";

export interface ContentBlock {
  id: string;
  block: BlockResponseData;
  order: number;
  content?: SheetProps | null;
  state?: Record<string, unknown>;
  comments?: any[];
}

const DocumentTemplateBuilder: React.FC<
  BuilderComponentProps<
    DocumentCategoryResponseData,
    DocumentCategoryRepository
  >
> = ({ repo, resource, state, setState, generatedData, updateGlobalState }) => {
  const navigate = useNavigate();
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [draggedBlock, setDraggedBlock] = useState<BlockResponseData | null>(
    null
  );
  const [draggedContentBlock, setDraggedContentBlock] =
    useState<ContentBlock | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Initialize contentBlocks with existing content if in update mode
  useEffect(() => {
    if (
      state.content &&
      Array.isArray(state.content) &&
      state.content.length > 0
    ) {
      // Safely map the existing content to ContentBlock format
      const existingBlocks = state.content.map((item: any, index: number) => ({
        id: item.id || crypto.randomUUID(),
        block: item.block || item,
        order: item.order || index + 1,
      }));
      setContentBlocks(existingBlocks);
    }
  }, [state.content]);

  const handleUpdateTemplate = useCallback(async () => {
    if (!repo) return;

    Alert.flash("Updating Template", "info", "Updating template...").then(
      async (res) => {
        if (res.isConfirmed) {
          try {
            const response = await repo.update("documentCategories", state.id, {
              ...state,
              content: contentBlocks,
            });

            if (response.code === 200) {
              toast.success("Template updated successfully");
              navigate(`/specifications/document-categories`);
            }
          } catch (error) {
            Alert.flash(
              "Error Updating Template",
              "error",
              "Error updating template"
            );
          }
        }
      }
    );
  }, [repo, state.id, contentBlocks, navigate]);

  // Handle drag start from toolbar
  const handleToolbarDragStart = (
    e: React.DragEvent,
    block: BlockResponseData
  ) => {
    setDraggedBlock(block);
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("text/plain", JSON.stringify(block));

    // Add visual feedback
    e.currentTarget.classList.add("dragging");
  };

  // Handle drag end from toolbar
  const handleToolbarDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("dragging");
    setDraggedBlock(null);
  };

  // Handle drag start from content area
  const handleContentDragStart = (
    e: React.DragEvent,
    contentBlock: ContentBlock
  ) => {
    setDraggedContentBlock(contentBlock);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", JSON.stringify(contentBlock));

    // Add visual feedback
    e.currentTarget.classList.add("dragging");
  };

  // Handle drag end from content area
  const handleContentDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("dragging");
    setDraggedContentBlock(null);
  };

  // Handle drop in content area
  const handleContentDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (draggedBlock) {
      // Adding new block from toolbar
      const newBlock: ContentBlock = {
        id: crypto.randomUUID(),
        block: draggedBlock,
        order: contentBlocks.length + 1,
      };
      setContentBlocks((prev) => [...prev, newBlock]);
      setDraggedBlock(null);
    } else if (draggedContentBlock) {
      // Reordering existing block
      const rect = e.currentTarget.getBoundingClientRect();
      const dropY = e.clientY - rect.top;
      const blockHeight = rect.height / Math.max(contentBlocks.length, 1);
      const dropIndex = Math.floor(dropY / blockHeight);

      setContentBlocks((prev) => {
        const filtered = prev.filter(
          (block) => block.id !== draggedContentBlock.id
        );
        const newOrder = [...filtered];
        newOrder.splice(dropIndex, 0, draggedContentBlock);

        // Update order numbers (starting from 1)
        return newOrder.map((block, index) => ({
          ...block,
          order: index + 1,
        }));
      });
      setDraggedContentBlock(null);
    }
  };

  // Handle drag over in content area
  const handleContentDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
    e.dataTransfer.dropEffect = draggedBlock ? "copy" : "move";
  };

  // Handle drag leave from content area
  const handleContentDragLeave = (e: React.DragEvent) => {
    // Only set drag over to false if we're leaving the content area entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  // Remove block from content
  const removeBlock = (blockId: string) => {
    setContentBlocks((prev) => {
      const filtered = prev.filter((block) => block.id !== blockId);
      return filtered.map((block, index) => ({
        ...block,
        order: index + 1,
      }));
    });
  };

  return (
    <div className="paper__editor__container">
      <div className="paper__editor__header">
        {state.blocks && state.blocks.length > 0 ? (
          <div className="paper__editor__toolbar">
            {state.blocks.map((block: BlockResponseData, index: number) => (
              <div
                key={block.id || index}
                className="paper__editor__toolbar__item"
                draggable
                onDragStart={(e) => handleToolbarDragStart(e, block)}
                onDragEnd={handleToolbarDragEnd}
                title={`${block.title} (${block.data_type}) - Drag to add`}
              >
                <i className={block.icon}></i>
                <span className="paper__editor__toolbar__label">
                  {block.title}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="paper__editor__empty__state">
            <p>No blocks available</p>
          </div>
        )}
        <div className="paper__editor__header__actions">
          <button
            className="paper__editor__submit__btn"
            onClick={handleUpdateTemplate}
            disabled={contentBlocks.length === 0}
          >
            <i className="ri-send-plane-line"></i>
            <span>Submit Template</span>
          </button>
        </div>
      </div>
      <div
        className={`paper__editor__content ${isDragOver ? "drag-over" : ""}`}
        onDrop={handleContentDrop}
        onDragOver={handleContentDragOver}
        onDragLeave={handleContentDragLeave}
      >
        {contentBlocks.length > 0 ? (
          <div className="paper__editor__content__blocks">
            {contentBlocks.map((contentBlock) => (
              <div
                key={contentBlock.id}
                className="paper__editor__content__block"
                draggable
                onDragStart={(e) => handleContentDragStart(e, contentBlock)}
                onDragEnd={handleContentDragEnd}
              >
                <div className="paper__editor__block__header">
                  <div className="paper__editor__block__drag__handle">
                    <i className="ri-drag-move-line"></i>
                  </div>
                  <div className="paper__editor__block__info">
                    <span className="paper__editor__block__title">
                      {contentBlock.block.title}
                    </span>
                    <span className="paper__editor__block__type">
                      {contentBlock.block.data_type}
                    </span>
                  </div>
                  <div className="paper__editor__block__actions">
                    <button
                      className="paper__editor__block__remove"
                      onClick={() => removeBlock(contentBlock.id)}
                      title="Remove block"
                    >
                      <i className="ri-close-line"></i>
                    </button>
                  </div>
                </div>
                <div className="paper__editor__block__content">
                  <p>Block content will be rendered here</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="paper__editor__content__placeholder">
            <div className="paper__editor__drop__zone">
              <i className="ri-arrow-up-line"></i>
              <p>
                Drag blocks from the toolbar above to start building your
                document
              </p>
            </div>
          </div>
        )}
      </div>
      <div className="paper__editor__footer">
        <div className="paper__editor__footer__info">
          <span>
            {contentBlocks.length > 0
              ? `${contentBlocks.length} block${
                  contentBlocks.length === 1 ? "" : "s"
                } in document`
              : "Ready to build document template"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DocumentTemplateBuilder;
