import React from "react";
import { ContentBlock } from "@/resources/views/crud/DocumentTemplateBuilder";
import InlineContentCard from "../ContentCards/InlineContentCard";
import moment from "moment";
import organizationLogo from "../../../assets/images/logo.png";
import { ProcessFlowConfigProps } from "../../crud/DocumentWorkflow";

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
}

const A4Sheet: React.FC<A4SheetProps> = ({
  state,
  actions,
  handleDragStart,
  handleDragOver,
  handleDrop,
  handleDragEnter,
  handleAddResourceLink,
  handleManageItem,
  handleRemoveItem,
  editingItems,
  TemplateHeader,
}) => {
  return (
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
                    state.resourceLinks?.some((link) => link.id === bodyItem.id)
                      ? "active"
                      : ""
                  }`}
                  onClick={() => handleAddResourceLink(bodyItem)}
                  title={
                    state.resourceLinks?.some((link) => link.id === bodyItem.id)
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
  );
};

export default A4Sheet;
