import {
  ContentAreaProps,
  OptionsContentAreaProps,
  TableContentAreaProps,
} from "app/Hooks/useBuilder";
import React, { useState } from "react";
import DynamicTableBuilder from "./DynamicTableBuilder";
import ContentBlockView from "../blocks/ContentBlockView";
import { BaseResponse } from "@/app/Repositories/BaseRepository";
import ContentEditor from "../blocks/ContentEditor";
import { BlockDataTypeMap } from "../blocks";
import { BlockDataType } from "@/app/Repositories/Block/data";
import { ConfigState } from "app/Hooks/useTemplateHeader";
import { useTemplateBoard } from "app/Context/TemplateBoardContext";

interface TemplateBuilderProps<T extends BaseResponse> {
  resource?: T | null;
  editor?: boolean;
  isPreview?: boolean;
}

const TemplateBuilderView: React.FC<TemplateBuilderProps<BaseResponse>> = ({
  resource,
  editor = false,
  isPreview = false,
}) => {
  const { state, actions } = useTemplateBoard();
  const contents = state.contents;

  // console.log(contents);

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const reorderedContents = [...contents];
    const [draggedItem] = reorderedContents.splice(draggedIndex, 1);
    reorderedContents.splice(dropIndex, 0, draggedItem);

    // Update the order property for each content
    const updatedContents = reorderedContents.map((content, index) => ({
      ...content,
      order: index + 1,
    }));

    actions.reorderContents(updatedContents);

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // console.log(state.contents);

  return (
    <div className="template__page__preview">
      {contents.map((block, index) => {
        const content = block.content as OptionsContentAreaProps;
        const isDragging = draggedIndex === index;
        const isDragOver = dragOverIndex === index;

        return editor && !isPreview ? (
          <div
            key={block.id}
            className={`draggable__content ${isDragging ? "dragging" : ""} ${
              isDragOver ? "drag-over" : ""
            }`}
          >
            <div className="content__editor__header">
              <div
                className="drag__handle"
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
              >
                <i className="ri-draggable"></i>
                <span>Drag Me</span>
              </div>
            </div>
            <ContentEditor resource={resource ?? null} block={block} />
          </div>
        ) : (
          <div
            key={block.id}
            className={`draggable__content ${isDragging ? "dragging" : ""} ${
              isDragOver ? "drag-over" : ""
            }`}
          >
            <ContentBlockView blockId={block.id} />
          </div>
        );
      })}
    </div>
  );
};

export default TemplateBuilderView;
