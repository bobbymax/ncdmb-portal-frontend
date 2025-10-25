import React, { useState } from "react";
import { DocumentResponseData } from "@/app/Repositories/Document/data";
import { UserResponseData } from "@/app/Repositories/User/data";
import { scopes } from "app/Hooks/usePolicy";
import LinkedPageItem from "./LinkedPageItem";

interface LinkedPagesSectionProps {
  pages: DocumentResponseData[];
  isLoading: boolean;
  uplines: (
    scope?: keyof typeof scopes,
    flag?: "group" | "grade",
    group_id?: number
  ) => UserResponseData[];
}

const LinkedPagesSection: React.FC<LinkedPagesSectionProps> = ({
  pages,
  isLoading,
  uplines,
}) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const handleTabChange = (index: number) => {
    setActiveTabIndex(index);
  };

  if (isLoading) {
    return (
      <div className="linked-pages-section">
        <div className="linked-pages-loading">
          <i className="ri-loader-4-line animate-spin"></i>
          <span>Loading linked documents...</span>
        </div>
      </div>
    );
  }

  if (pages.length === 0) {
    return null;
  }

  return (
    <div className="linked-pages-section">
      {/* Header */}
      <div className="linked-pages-header">
        <div className="linked-pages-header__content">
          <i className="ri-file-list-3-line"></i>
          <h3>Linked Documents</h3>
          <span className="linked-pages-count">
            {pages.length} document{pages.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="linked-pages-tabs">
        {pages.map((page, index) => (
          <button
            key={page.id}
            className={`linked-page-tab ${
              activeTabIndex === index ? "active" : ""
            }`}
            onClick={() => handleTabChange(index)}
          >
            <i className="ri-file-text-line"></i>
            <span className="tab-title">
              {page.title || `Document ${index + 1}`}
            </span>
            {page.document_category && (
              <span className="tab-category">
                {page.document_category.name}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Active Page Content */}
      <div className="linked-pages-content">
        {pages[activeTabIndex] && (
          <LinkedPageItem
            key={pages[activeTabIndex].id}
            page={pages[activeTabIndex]}
            index={activeTabIndex}
            totalPages={pages.length}
            uplines={uplines}
          />
        )}
      </div>
    </div>
  );
};

export default LinkedPagesSection;
