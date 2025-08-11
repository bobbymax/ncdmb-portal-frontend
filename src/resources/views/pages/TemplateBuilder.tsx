import React, { useCallback, useState } from "react";
import { useTemplateBoard } from "app/Context/TemplateBoardContext";
import { BaseRepository } from "@/app/Repositories/BaseRepository";
import { BlockResponseData } from "@/app/Repositories/Block/data";
import { BlockDataType } from "@/app/Repositories/Block/data";
import { ContentAreaProps } from "app/Hooks/useBuilder";
import { BaseResponse } from "app/Repositories/BaseRepository";
import useBuilder from "app/Hooks/useBuilder";
import { useTemplateHeader } from "app/Hooks/useTemplateHeader";
import TemplateBuilderView from "resources/views/crud/templates/builders/TemplateBuilderView";
import { toTitleCase } from "bootstrap/repositories";
import moment from "moment";
import Button from "resources/views/components/forms/Button";

interface TemplateBuilderProps {
  Repository: BaseRepository;
  resource?: BaseResponse | null;
  generatedData?: unknown;
}

const TemplateBuilder: React.FC<TemplateBuilderProps> = ({
  Repository,
  resource,
  generatedData,
}) => {
  const { state, actions } = useTemplateBoard();
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>(
    {}
  );
  const [blocksAreaPosition, setBlocksAreaPosition] = useState({ x: 8, y: 8 });
  const [isDraggingBlocks, setIsDraggingBlocks] = useState(false);

  const { blocks } = useBuilder(state.template);
  const getTemplateHeader = useTemplateHeader(state.template);

  const handleAddToSheet = useCallback(
    (block: BlockResponseData, type: BlockDataType) => {
      actions.addContent(block, type);
    },
    [actions]
  );

  // Helper to group blocks by input_type
  const groupBlocksByType = (blocks: BlockResponseData[]) => {
    return blocks.reduce((acc, block) => {
      const type = block.input_type;
      if (!acc[type]) acc[type] = [];
      acc[type].push(block);
      return acc;
    }, {} as Record<string, BlockResponseData[]>);
  };

  const toggleDropdown = (type: string) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const handleBlocksAreaDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDraggingBlocks(true);

    const blocksArea = e.currentTarget.closest(
      ".blocks__content__area"
    ) as HTMLElement;
    const parent = blocksArea?.parentElement;

    if (!blocksArea || !parent) {
      return;
    }

    const rect = blocksArea.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();

      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }

      animationFrameId = requestAnimationFrame(() => {
        const newX = e.clientX - parentRect.left - offsetX;
        const newY = e.clientY - parentRect.top - offsetY;

        // Constrain to parent bounds with minimum offset
        const maxX = Math.max(0, parentRect.width - 100);
        const maxY = Math.max(0, parentRect.height - 300);

        const constrainedX = Math.max(8, Math.min(newX, maxX));
        const constrainedY = Math.max(8, Math.min(newY, maxY));

        setBlocksAreaPosition({
          x: constrainedX,
          y: constrainedY,
        });
      });
    };

    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      setIsDraggingBlocks(false);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove, { passive: false });
    document.addEventListener("mouseup", handleMouseUp, { passive: false });
  };

  if (!state.template) {
    return (
      <div className="template__builder__container">
        <div className="template__builder__empty">
          <i className="ri-layout-line"></i>
          <h4>No Template Selected</h4>
          <p>Please select a template to start building your document</p>
        </div>
      </div>
    );
  }

  return (
    <div className="template__builder__container">
      <div className="template__page paper__container">
        {/* Blocks Area */}
        <div
          className={`blocks__content__area ${
            isDraggingBlocks ? "dragging" : ""
          }`}
          style={{
            top: `${blocksAreaPosition.y}px`,
            left: `${blocksAreaPosition.x}px`,
          }}
          onMouseDown={handleBlocksAreaDragStart}
        >
          <div
            className="blocks__header"
            onMouseDown={handleBlocksAreaDragStart}
          >
            <div
              className="blocks__drag__handle"
              onMouseDown={handleBlocksAreaDragStart}
            >
              <i className="ri-draggable"></i>
            </div>
          </div>

          {Object.entries(groupBlocksByType(blocks)).map(
            ([type, groupBlocks]) => {
              const blocksArr = groupBlocks as BlockResponseData[];

              if (blocksArr.length === 1) {
                return (
                  <div key={type} className="blocks__group">
                    <div className="blocks__group__items">
                      <div
                        className="blocks__item"
                        onClick={() =>
                          handleAddToSheet(blocksArr[0], blocksArr[0].data_type)
                        }
                      >
                        <i className={blocksArr[0].icon} />
                        <div className="blocks__item__title">
                          {blocksArr[0].title}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={type} className="blocks__group">
                  <div className="blocks__group__items">
                    <div className="blocks__dropdown">
                      <div
                        className="blocks__dropdown__trigger"
                        onClick={() => toggleDropdown(type)}
                      >
                        <i className={blocksArr[0].icon} />
                        <div className="blocks__item__title">
                          {toTitleCase(type.replace(/Block$/, ""))}
                        </div>
                        <i
                          className={
                            openDropdowns[type]
                              ? "ri-arrow-up-s-line"
                              : "ri-arrow-down-s-line"
                          }
                        />
                      </div>
                      {openDropdowns[type] && (
                        <div className="blocks__dropdown__content">
                          {blocksArr.map((block: BlockResponseData) => (
                            <div
                              key={block.id}
                              className="blocks__dropdown__item"
                              onClick={() => {
                                handleAddToSheet(block, block.data_type);
                                toggleDropdown(type);
                              }}
                            >
                              <i className={block.icon} />
                              <div className="blocks__dropdown__item__title">
                                {block.title}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>

        {/* Template Header */}
        <div className="paper__header">
          {getTemplateHeader({
            configState: state.configState,
            title: state.documentState.title || "Document Title",
            date: moment().format(),
            ref: null,
          })}
        </div>

        {/* Template Body */}
        <div className="paper__body">
          <TemplateBuilderView resource={resource} editor />
        </div>

        {/* Template Footer */}
        <div className="paper__footer">
          <div className="template__builder__stats">
            <span>{state.contents.length} content blocks</span>
            <span>Template: {state.template.name}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateBuilder;
