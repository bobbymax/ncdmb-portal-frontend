import { DocumentResponseData } from "@/app/Repositories/Document/data";
import DocumentRepository from "@/app/Repositories/Document/DocumentRepository";
import { DocumentCategoryResponseData } from "@/app/Repositories/DocumentCategory/data";
import { DocumentTypeResponseData } from "@/app/Repositories/DocumentType/data";
import DocumentCategoryRepository from "@/app/Repositories/DocumentCategory/DocumentCategoryRepository";
import { CardPageComponentProps } from "@/bootstrap";
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const colors = [
  "#f8f9fb", // default
  "#e9ecef", // soft gray
  "#f3e8ff", // soft purple
  "#e0f7fa", // soft blue
  "#fff3e0", // soft orange
  "#e8f5e9", // soft green
  "#fce4ec", // soft pink
];

const buttonColors = [
  "#004d40", // for #f8f9fb
  "#1b1f3b", // for #e9ecef
  "#a259ff", // for #f3e8ff
  "#00796b", // for #e0f7fa
  "#ff9800", // for #fff3e0
  "#388e3c", // for #e8f5e9
  "#c2185b", // for #fce4ec
];

const Categories: React.FC<
  CardPageComponentProps<DocumentCategoryResponseData, any>
> = ({ Repository }) => {
  const navigate = useNavigate();
  const [documentTypes, setDocumentTypes] = useState<
    DocumentTypeResponseData[]
  >([]);
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());

  // Function to toggle card expansion
  const toggleCardExpansion = (cardIndex: number) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(cardIndex)) {
        newSet.delete(cardIndex);
      } else {
        newSet.add(cardIndex);
      }
      return newSet;
    });
  };

  // Function to check if categories list has scroll
  const checkScroll = (element: HTMLDivElement) => {
    if (element) {
      const hasScroll = element.scrollHeight > element.clientHeight;
      const container = element.parentElement;
      if (container) {
        if (hasScroll) {
          container.classList.add("has-scroll");
        } else {
          container.classList.remove("has-scroll");
        }
      }
    }
  };

  useEffect(() => {
    const fetchDocumentTypes = async () => {
      const result = await Repository.collection("documentTypes");
      if (result) setDocumentTypes(result.data as DocumentTypeResponseData[]);
    };
    fetchDocumentTypes();
  }, []);

  // Check scroll on document types change
  useEffect(() => {
    const checkAllScrolls = () => {
      const categoryLists = document.querySelectorAll(".categories_list");
      categoryLists.forEach((list) => {
        if (list instanceof HTMLDivElement) {
          checkScroll(list);
        }
      });
    };

    // Check after a short delay to ensure DOM is updated
    const timer = setTimeout(checkAllScrolls, 100);
    return () => clearTimeout(timer);
  }, [documentTypes]);

  // Handle window resize for scroll detection
  useEffect(() => {
    const handleResize = () => {
      const categoryLists = document.querySelectorAll(".categories_list");
      categoryLists.forEach((list) => {
        if (list instanceof HTMLDivElement) {
          checkScroll(list);
        }
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="document_types_grid">
      {documentTypes.map((docType, idx) => (
        <div
          className="document_type_item fade-in-bounce"
          key={idx}
          style={{
            background: colors[idx % colors.length],
          }}
        >
          <div className="document_type__header">
            <div className="document_type__title">
              <h3>{docType.name}</h3>
              <p className="document_type__description">
                {docType.description}
              </p>
            </div>
          </div>

          <div
            className={`document_type__categories ${
              expandedCards.has(idx) ? "expanded" : ""
            }`}
          >
            {docType.categories && docType.categories.length > 0 ? (
              <div
                className={`categories_list ${
                  expandedCards.has(idx) ? "expanded" : "collapsed"
                }`}
                ref={(el) => {
                  if (el) {
                    checkScroll(el);
                  }
                }}
              >
                {docType.categories.map((category, catIdx) => (
                  <div
                    key={catIdx}
                    className="category_item"
                    onClick={() => {
                      navigate(`/desk/folders/category/${category.id}/create`);
                    }}
                  >
                    <div className="category__content">
                      <i className={category.icon} />
                      <span className="category__name">{category.name}</span>
                    </div>
                    <i className="ri-arrow-right-s-line category__arrow" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="no_categories">
                <i className="ri-folder-line" />
                <p>No categories available</p>
              </div>
            )}
          </div>

          {/* Collapsible Menu Button */}
          <button
            className={`collapse_btn ${
              expandedCards.has(idx) ? "expanded" : ""
            } ${
              !docType.categories || docType.categories.length === 0
                ? "disabled"
                : ""
            }`}
            onClick={() => toggleCardExpansion(idx)}
            disabled={!docType.categories || docType.categories.length === 0}
            aria-label={
              !docType.categories || docType.categories.length === 0
                ? "No categories available"
                : expandedCards.has(idx)
                ? "Collapse categories"
                : "Expand categories"
            }
          >
            <i className="ri-arrow-down-s-line" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Categories;
