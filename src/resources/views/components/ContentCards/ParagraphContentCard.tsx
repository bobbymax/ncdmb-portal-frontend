import React, { useState } from "react";
import { usePaperBoard } from "app/Context/PaperBoardContext";
import { ContentBlock } from "@/resources/views/crud/DocumentTemplateBuilder";
import { SheetProps } from "../../pages/DocumentTemplateContent";

interface ParagraphContentCardProps {
  item: ContentBlock;
  onClose: () => void;
  isEditing: boolean;
}

const ParagraphContentCard: React.FC<ParagraphContentCardProps> = ({
  item,
  onClose,
  isEditing,
}) => {
  const { state, actions } = usePaperBoard();
  const [paragraph, setParagraph] = useState("");

  const handleSave = () => {
    const updatedItem = {
      ...item,
      content: {
        id: item.id,
        order: item.order,
      } as SheetProps,
    };

    const newBody = state.body.map((bodyItem) =>
      bodyItem.id === item.id ? updatedItem : bodyItem
    );

    actions.setBody(newBody);
    onClose();
  };

  if (isEditing) {
    return (
      <div className="inline__content__card paragraph__card">
        <div className="inline__card__header">
          <h5>Paragraph Configuration</h5>
        </div>
        <div className="inline__card__content">
          <div className="form__group">
            <label>Paragraph Content</label>
            <textarea
              value={paragraph}
              onChange={(e) => setParagraph(e.target.value)}
              placeholder="Enter paragraph content..."
              className="form__textarea"
              rows={3}
            />
          </div>
          <div className="inline__card__actions">
            <button className="btn__secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn__primary" onClick={handleSave}>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    );
  }

  // View mode
  return (
    <div className="inline__content__card paragraph__card view__mode">
      <div className="inline__card__header">
        <h5>Paragraph</h5>
      </div>
      <div className="inline__card__content">
        <div className="content__display">
          <div className="content__field">
            <label>Content:</label>
            <span className="content__text">
              {paragraph || "No paragraph content set"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParagraphContentCard;
