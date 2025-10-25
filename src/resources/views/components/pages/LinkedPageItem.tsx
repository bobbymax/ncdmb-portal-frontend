import React from "react";
import { DocumentResponseData } from "@/app/Repositories/Document/data";
import A4Sheet from "./A4Sheet";
import { UserResponseData } from "@/app/Repositories/User/data";
import { scopes } from "app/Hooks/usePolicy";
import { useTemplateHeader } from "app/Hooks/useTemplateHeader";
import LinkedPageContextWrapper from "./LinkedPageContextWrapper";

interface LinkedPageItemProps {
  page: DocumentResponseData;
  index: number;
  totalPages: number;
  uplines: (
    scope?: keyof typeof scopes,
    flag?: "group" | "grade",
    group_id?: number
  ) => UserResponseData[];
}

const LinkedPageItem: React.FC<LinkedPageItemProps> = ({
  page,
  index,
  totalPages,
  uplines,
}) => {
  // Get the template header for this specific page using the hook properly
  const PageTemplateHeader = useTemplateHeader(
    page.document_category?.template
  );

  // No-op handlers for read-only A4Sheet
  const noopHandler = () => {};
  const noopDragHandler = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="linked-page-item">
      <div className="linked-page-number">
        Document {index + 1} of {totalPages}
      </div>
      <div className="linked-page-wrapper">
        {/* Wrap with context to isolate this page's state */}
        <LinkedPageContextWrapper page={page}>
          <A4Sheet
            state={{
              body: page.contents || [],
              configState: page.config || null,
              documentState: page,
              resourceLinks: page.contents || [],
              template: page.document_category?.template || null,
            }}
            actions={{
              setBody: noopHandler,
            }}
            currentTracker={null}
            currentPageActions={[]}
            handleDragStart={noopDragHandler}
            handleDragOver={noopDragHandler}
            handleDrop={noopDragHandler}
            handleDragEnter={noopDragHandler}
            handleAddResourceLink={noopHandler}
            handleManageItem={noopHandler}
            handleRemoveItem={noopHandler}
            editingItems={new Set()}
            TemplateHeader={PageTemplateHeader}
            isEditor={false}
            uplines={uplines}
          />
        </LinkedPageContextWrapper>
      </div>
    </div>
  );
};

export default LinkedPageItem;
