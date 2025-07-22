import { DocumentResponseData } from "@/app/Repositories/Document/data";
import DocumentRepository from "@/app/Repositories/Document/DocumentRepository";
import { DocumentCategoryResponseData } from "@/app/Repositories/DocumentCategory/data";
import DocumentCategoryRepository from "@/app/Repositories/DocumentCategory/DocumentCategoryRepository";
import { CardPageComponentProps } from "@/bootstrap";
import React, { useEffect, useState } from "react";

const Categories: React.FC<
  CardPageComponentProps<
    DocumentCategoryResponseData,
    DocumentCategoryRepository
  >
> = ({ Repository, onManageRawData, View }) => {
  const [categories, setCategories] = useState<DocumentCategoryResponseData[]>(
    []
  );

  console.log(categories);

  useEffect(() => {
    const fetchCategories = async () => {
      const result = await Repository.collection("documentCategories");

      if (result) {
        setCategories(result.data as DocumentCategoryResponseData[]);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div
      className="flex align gap-lg start"
      style={{
        flexWrap: "wrap",
      }}
    >
      {categories
        .filter((category) => category.workflow_id < 1)
        .map((cat, idx) => (
          <div
            className="document_category_item"
            key={idx}
            style={{
              width: "19.1%",
            }}
          >
            <div className="category__item__header flex align start gap-md">
              <i className={cat.icon} />
              <small>{cat.name}</small>
            </div>
          </div>
        ))}
    </div>
  );
};

export default Categories;
