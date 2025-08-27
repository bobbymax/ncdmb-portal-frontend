import React from "react";
import { ContentBlock } from "@/resources/views/crud/DocumentTemplateBuilder";

interface EventContentCardProps {
  item: ContentBlock;
  onClose: () => void;
  isEditing: boolean;
}

const EventContentCard: React.FC<EventContentCardProps> = ({
  item,
  onClose,
  isEditing,
}) => {
  if (isEditing) {
    return (
      <div className="inline__content__card event__card">
        <div className="inline__card__header">
          <h5>Event Configuration</h5>
        </div>
        <div className="inline__card__content">
          <p>Event configuration coming soon...</p>
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
    <div className="inline__content__card event__card view__mode">
      <div className="inline__card__header">
        <h5>Event</h5>
      </div>
      <div className="inline__card__content">
        <div className="content__display">
          <div className="content__field">
            <label>Status:</label>
            <span className="content__text">
              Event configuration coming soon...
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventContentCard;
