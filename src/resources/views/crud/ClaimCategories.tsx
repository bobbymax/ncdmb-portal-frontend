import { DocumentCategoryResponseData } from "app/Repositories/DocumentCategory/data";
import DocumentCategoryRepository from "app/Repositories/DocumentCategory/DocumentCategoryRepository";
import { CardPageComponentProps } from "bootstrap";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const ClaimCategories: React.FC<
  CardPageComponentProps<
    DocumentCategoryResponseData,
    DocumentCategoryRepository
  >
> = ({ Repository, collection, onManageRawData, View }) => {
  const [categories, setCategories] = useState<DocumentCategoryResponseData[]>(
    []
  );

  useEffect(() => {
    if (collection.length > 0) {
      const claimCategories = collection.filter(
        (cat) => cat?.document_type === "claim"
      );

      // Prevent unnecessary state updates
      if (JSON.stringify(claimCategories) !== JSON.stringify(categories)) {
        setCategories(claimCategories);
      }
    }
  }, [collection]);

  return (
    <>
      <div className="claim-categories">
        {categories.map((cat, i) => (
          <Link
            to={`/hub/claims/${cat.label}/create`}
            key={i}
            className="custom-card category-links"
          >
            <i className={`${cat.icon} claim-category-icons`} />
            <p>{cat.name}</p>
            <small>{cat.description}</small>
            <div className="cover"></div>
          </Link>
        ))}
      </div>
    </>
  );
};

export default ClaimCategories;
