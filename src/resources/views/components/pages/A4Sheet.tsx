import React from "react";
import { ContentBlock } from "@/resources/views/crud/DocumentTemplateBuilder";
import InlineContentCard from "../ContentCards/InlineContentCard";
import moment from "moment";
import organizationLogo from "../../../assets/images/logo.png";
import { ProcessFlowConfigProps } from "../../crud/DocumentWorkflow";
import { ContextType } from "app/Context/PaperBoardContext";

interface A4SheetProps {
  // State props
  state: {
    body: ContentBlock[];
    configState: ProcessFlowConfigProps | null;
    documentState: { title?: string } | null;
    resourceLinks: ContentBlock[] | null;
    template: any;
  };

  // Action props
  actions: {
    setBody: (body: ContentBlock[]) => void;
  };

  // Handler props
  // context: ContextType;
  handleDragStart: (e: React.DragEvent, index: number) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent, dropIndex?: number) => void;
  handleDragEnter: (e: React.DragEvent, index?: number) => void;
  handleAddResourceLink: (contentBlock: ContentBlock) => void;
  handleManageItem: (itemId: string) => void;
  handleRemoveItem: (itemId: string) => void;

  // Other props
  editingItems: Set<string>;
  TemplateHeader: React.ComponentType<{
    configState: ProcessFlowConfigProps;
    title: string | null;
    date: string;
    ref: any;
  }>;
  isEditor: boolean;
}

const A4Sheet: React.FC<A4SheetProps> = ({
  state,
  actions,
  // context,
  handleDragStart,
  handleDragOver,
  handleDrop,
  handleDragEnter,
  handleAddResourceLink,
  handleManageItem,
  handleRemoveItem,
  editingItems,
  TemplateHeader,
  isEditor,
}) => {
  return (
    <div className="a4__sheet" data-context={isEditor ? "generator" : "desk"}>
      {/* Background logo with fade effect */}
      <div
        className="a4__sheet__logo"
        style={{
          backgroundImage: `url(${organizationLogo})`,
        }}
      />

      {/* Faded background overlay */}
      <div className="a4__sheet__overlay" />

      {/* Subtle paper texture overlay */}
      <div className="a4__sheet__texture" />

      {/* Enhanced Header with subtle background */}
      <div className="sheet__header sheet__header--enhanced">
        <TemplateHeader
          configState={state.configState as ProcessFlowConfigProps}
          title={state.documentState?.title ?? null}
          date={moment().format("DD/MM/YYYY")}
          ref={null}
        />
      </div>

      {isEditor && (
        <div
          className="sheet__content sheet__content--enhanced"
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
      )}

      {!isEditor && state.body && state.body.length > 0 && (
        <div className="desk-content" style={{ padding: "20px 30px" }}>
          {state.body.map((bodyItem, idx) => (
            <div key={idx} className="body__item__content--desk">
              <InlineContentCard
                item={bodyItem}
                onClose={() => handleManageItem(bodyItem.id)}
                isEditing={editingItems.has(bodyItem.id)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Enhanced Footer with subtle background */}
      <div className="sheet__footer sheet__footer--enhanced">
        {/* Footer content */}
        <div className="sheet__footer__content">
          <div className="sheet__footer__item sheet__footer__item--left">
            <span>Generated on {moment().format("DD/MM/YYYY")}</span>
          </div>
          <div className="sheet__footer__item sheet__footer__item--center">
            <span>NCDMB Document Template</span>
          </div>
          <div className="sheet__footer__item sheet__footer__item--right">
            <span>Page 1 of 1</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default A4Sheet;
