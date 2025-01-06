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
      const claimCategories =
        collection.filter((cat) => cat?.document_type === "Claim") ?? [];
      setCategories(claimCategories);
    }
  }, [collection]);

  return (
    <>
      <div className="claim-categories">
        {categories.map((cat, i) => (
          <Link
            to={`/staff-services/claims/${cat.id}/create`}
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
