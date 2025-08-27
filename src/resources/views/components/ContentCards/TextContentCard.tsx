import React, { useState } from "react";
import { usePaperBoard } from "app/Context/PaperBoardContext";
import { ContentBlock } from "@/resources/views/crud/DocumentTemplateBuilder";

interface TextContentCardProps {
  item: ContentBlock;
  onClose: () => void;
  isEditing: boolean;
}

const TextContentCard: React.FC<TextContentCardProps> = ({
  item,
  onClose,
  isEditing,
}) => {
  const { state, actions } = usePaperBoard();
  const [text, setText] = useState("");

  const handleSave = () => {
    const updatedItem = {
      ...item,
      content: {
        id: item.id,
        order: item.order,
        paper_title: undefined,
        title: undefined,
        paragraph: undefined,
        expense: undefined,
        invoice: undefined,
        requisition: undefined,
        signature: undefined,
        text,
        table: undefined,
        list: undefined,
        header: undefined,
        event: undefined,
      },
    };

    const newBody = state.body.map((bodyItem) =>
      bodyItem.id === item.id ? updatedItem : bodyItem
    );

    actions.setBody(newBody);
    onClose();
  };

  if (isEditing) {
    return (
      <div className="inline__content__card text__card">
        <div className="inline__card__header">
          <h5>Text Configuration</h5>
        </div>
        <div className="inline__card__content">
          <div className="form__group">
            <label>Text Content</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text content..."
              className="form__textarea"
              rows={2}
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
    <div className="inline__content__card text__card view__mode">
      <div className="inline__card__header">
        <h5>Text</h5>
      </div>
      <div className="inline__card__content">
        <div className="content__display">
          <div className="content__field">
            <label>Content:</label>
            <span className="content__text">
              {text || "No text content set"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextContentCard;
