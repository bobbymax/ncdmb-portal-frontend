import React from "react";

export type ViewModeType = "document" | "uploads" | "print";

interface ViewModeTogglerProps {
  viewMode: ViewModeType;
  onViewModeChange: (mode: ViewModeType) => void;
}

const ViewModeToggler: React.FC<ViewModeTogglerProps> = ({
  viewMode,
  onViewModeChange,
}) => {
  return (
    <div
      style={{
        padding: "0 1.8rem",
      }}
      className="page__flipped"
    >
      {/* Page Flipped Content */}
      <div className={`page__flipped__toggler state-${viewMode}`}>
        <span
          className="toggle-label left"
          onClick={() => onViewModeChange("document")}
        >
          <i className="ri-file-text-line"></i>
          <span>Document</span>
        </span>
        <span
          className="toggle-label center"
          onClick={() => onViewModeChange("uploads")}
        >
          <i className="ri-upload-cloud-line"></i>
          <span>Uploads</span>
        </span>
      </div>
    </div>
  );
};

export default ViewModeToggler;
