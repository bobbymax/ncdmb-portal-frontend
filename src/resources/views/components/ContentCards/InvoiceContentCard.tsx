import React from "react";
import { ContentBlock } from "@/resources/views/crud/DocumentTemplateBuilder";

interface InvoiceContentCardProps {
  item: ContentBlock;
  onClose: () => void;
  isEditing: boolean;
}

const InvoiceContentCard: React.FC<InvoiceContentCardProps> = ({
  item,
  onClose,
  isEditing,
}) => {
  if (isEditing) {
    return (
      <div className="inline__content__card invoice__card">
        <div className="inline__card__header">
          <h5>Invoice Configuration</h5>
        </div>
        <div className="inline__card__content">
          <p>Invoice configuration coming soon...</p>
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
    <div className="inline__content__card invoice__card view__mode">
      <div className="inline__card__header">
        <h5>Invoice</h5>
      </div>
      <div className="inline__card__content">
        <div className="content__display">
          <div className="content__field">
            <label>Status:</label>
            <span className="content__text">
              Invoice configuration coming soon...
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceContentCard;
