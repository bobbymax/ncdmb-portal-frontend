import React, { useEffect, useState } from "react";
import { usePaperBoard } from "app/Context/PaperBoardContext";
import { ContentBlock } from "@/resources/views/crud/DocumentTemplateBuilder";
import { SheetProps } from "resources/views/pages/DocumentTemplateContent";

interface ParagraphContentCardProps {
  item: ContentBlock;
  onClose: () => void;
  isEditing: boolean;
}

const getParagraphValue = (value: unknown): string =>
  typeof value === "string" ? value : "";

const ParagraphContentCard: React.FC<ParagraphContentCardProps> = ({
  item,
  onClose,
  isEditing,
}) => {
  const { state, actions } = usePaperBoard();
  const [paragraph, setParagraph] = useState<string>(
    getParagraphValue(item.content?.paragraph)
  );

  useEffect(() => {
    if (isEditing) {
      setParagraph(getParagraphValue(item.content?.paragraph));
    }
  }, [isEditing, item]);

  const handleSave = () => {
    const updatedItem = {
      ...item,
      content: {
        id: item.id,
        order: item.order,
        paragraph: paragraph,
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
        <div className="inline__card__content">
          <div className="form__group">
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
    <div className="inline__card__content">
      <div className="content__display">
        <div className="content__field">
          <p style={{ whiteSpace: "pre-wrap", textAlign: "justify" }}>
            {getParagraphValue(item.content?.paragraph) ||
              "No paragraph content set"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ParagraphContentCard;
