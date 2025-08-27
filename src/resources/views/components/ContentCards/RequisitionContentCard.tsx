import React from "react";
import { ContentBlock } from "@/resources/views/crud/DocumentTemplateBuilder";

interface RequisitionContentCardProps {
  item: ContentBlock;
  onClose: () => void;
  isEditing: boolean;
}

const RequisitionContentCard: React.FC<RequisitionContentCardProps> = ({
  item,
  onClose,
  isEditing,
}) => {
  if (isEditing) {
    return (
      <div className="inline__content__card requisition__card">
        <div className="inline__card__header">
          <h5>Requisition Configuration</h5>
        </div>
        <div className="inline__card__content">
          <p>Requisition configuration coming soon...</p>
          <div className="inline__card__actions">
            <button className="btn__secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // View mode
  return (
    <div className="inline__content__card requisition__card view__mode">
      <div className="inline__card__header">
        <h5>Requisition</h5>
      </div>
      <div className="inline__card__content">
        <div className="content__display">
          <div className="content__field">
            <label>Status:</label>
            <span className="content__text">
              Requisition configuration coming soon...
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequisitionContentCard;
