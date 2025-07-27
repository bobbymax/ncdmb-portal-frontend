import { DocumentResponseData } from "@/app/Repositories/Document/data";
import DocumentRepository from "@/app/Repositories/Document/DocumentRepository";
import { DocumentCategoryResponseData } from "@/app/Repositories/DocumentCategory/data";
import DocumentCategoryRepository from "@/app/Repositories/DocumentCategory/DocumentCategoryRepository";
import { CardPageComponentProps } from "@/bootstrap";
import React, { useEffect, useState } from "react";
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
  const [categories, setCategories] = useState<DocumentCategoryResponseData[]>(
    []
  );

  useEffect(() => {
    const fetchCategories = async () => {
      const result = await Repository.collection("documentCategories");
      if (result) setCategories(result.data as DocumentCategoryResponseData[]);
    };
    fetchCategories();
  }, []);

  return (
    <div className="category_grid">
      {categories
        .filter((category) => category.workflow_id > 0)
        .map((cat, idx) => (
          <div
            className="document_category_item fade-in-bounce"
            key={idx}
            style={{
              background: colors[idx % colors.length],
            }}
          >
            <div className="category__item__header flex align start gap-md">
              <i className={cat.icon} />
              <small>{cat.name}</small>
            </div>
            <div className="category__item__desc">{cat.description}</div>
            <button
              className="category-cta-btn"
              style={{ background: buttonColors[idx % buttonColors.length] }}
              onClick={() => {
                /* your open file logic here */
                navigate(`/desk/folders/category/${cat.id}/create`);
              }}
            >
              <i
                className="ri-folder-open-line"
                style={{
                  marginRight: "0.6em",
                  fontSize: "1.2em",
                  verticalAlign: "middle",
                }}
              />
              Open
            </button>
          </div>
        ))}
    </div>
  );
};

export default Categories;
