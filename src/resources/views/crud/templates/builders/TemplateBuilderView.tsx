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

interface TemplateBuilderProps<T extends BaseResponse> {
  contents: ContentAreaProps[];
  resource?: T | null;
  editor?: boolean;
  isPreview?: boolean;
  modify: <T extends BlockDataType>(
    data: BlockDataTypeMap[T],
    identifier: keyof OptionsContentAreaProps,
    blockId: string | number
  ) => void;
  onReorder?: (reorderedContents: ContentAreaProps[]) => void;
  onRemove?: (blockId: string) => void;
  configState: ConfigState;
  generatedData: unknown;
  sharedState?: Record<string, any>;
}

const TemplateBuilderView: React.FC<TemplateBuilderProps<BaseResponse>> = ({
  resource,
  contents,
  editor = false,
  isPreview = false,
  modify,
  onReorder,
  onRemove,
  configState,
  generatedData,
  sharedState,
}) => {
  // console.log(generatedData);

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

    if (onReorder) {
      onReorder(updatedContents);
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

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
            <ContentEditor
              resource={resource ?? null}
              block={block}
              content={content}
              modify={modify}
              onRemove={onRemove}
              configState={configState}
              sharedState={generatedData as Record<string, unknown>}
            />
          </div>
        ) : (
          <div
            key={block.id}
            className={`draggable__content ${isDragging ? "dragging" : ""} ${
              isDragOver ? "drag-over" : ""
            }`}
          >
            <ContentBlockView
              content={content}
              configState={configState}
              generatedData={generatedData}
            />
          </div>
        );
      })}
    </div>
  );
};

export default TemplateBuilderView;
