import React, { useEffect } from "react";
import Button from "../forms/Button";
import { useLoader } from "app/Context/LoaderProvider";
import { useStateContext } from "app/Context/ContentContext";

const PageLoader = () => {
  const { isLoading } = useStateContext();
  const { status, content } = useLoader();

  return (
    <div className={`page__loader ${isLoading ? " visibility" : ""}`}>
      {content ? (
        <div className="page_loader_content">{content}</div>
      ) : (
        <div className="page_loader_content">
          <h1 className="loader-text mb-3">
            {status}
            <span className="dotted dotted1">.</span>
            <span className="dotted dotted2">.</span>
            <span className="dotted dotted3">.</span>
          </h1>
          <Button
            label="Cancel"
            icon="ri-close-large-line"
            variant="danger"
            rounded
          />
        </div>
      )}
    </div>
  );
};

export default PageLoader;
