import React from "react";
import { DocumentResponseData } from "@/app/Repositories/Document/data";

interface Block {
  id: string | number;
  title: string;
  icon: string;
  [key: string]: any;
}

interface DocumentToolbarProps {
  blocks: Block[];
  existingDocument: DocumentResponseData | null;
  onBlockDragStart: (e: React.DragEvent, block: Block) => void;
  onGenerateDocument: () => void;
}

const DocumentToolbar: React.FC<DocumentToolbarProps> = ({
  blocks,
  existingDocument,
  onBlockDragStart,
  onGenerateDocument,
}) => {
  return (
    <div className="document__template__paper__panel">
      {/* Toolbar with blocks */}
      <div className="paper__toolbar">
        <div className="toolbar__blocks">
          {blocks && blocks.length > 0 ? (
            blocks.map((block) => (
              <div
                key={block.id}
                className="toolbar__block"
                draggable
                onDragStart={(e) => onBlockDragStart(e, block)}
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
            onClick={onGenerateDocument}
          >
            <i
              className={
                existingDocument ? "ri-database-2-line" : "ri-store-line"
              }
            ></i>
            <span>{existingDocument ? "Update" : "Generate"} Document</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentToolbar;
