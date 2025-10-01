import React, { useState } from "react";
import { usePaperBoard } from "app/Context/PaperBoardContext";
import { ContentBlock } from "@/resources/views/crud/DocumentTemplateBuilder";

interface HeaderContentCardProps {
  item: ContentBlock;
  onClose: () => void;
  isEditing: boolean;
}

const HeaderContentCard: React.FC<HeaderContentCardProps> = ({
  item,
  onClose,
  isEditing,
}) => {
  const { state, actions } = usePaperBoard();
  const [headerText, setHeaderText] = useState("");

  const handleSave = () => {
    const updatedItem = {
      ...item,
      content: {
        id: item.id,
        order: item.order,
        payment_batch: undefined,
        paper_title: undefined,
        title: undefined,
        paragraph: undefined,
        expense: undefined,
        invoice: undefined,
        requisition: undefined,
        signature: undefined,
        text: undefined,
        table: undefined,
        list: undefined,
        header: headerText,
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
      <div className="inline__content__card header__card">
        <div className="inline__card__header">
          <h5>Header Configuration</h5>
        </div>
        <div className="inline__card__content">
          <div className="form__group">
            <label>Header Text</label>
            <input
              type="text"
              value={headerText}
              onChange={(e) => setHeaderText(e.target.value)}
              placeholder="Enter header text..."
              className="form__input"
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
    <div className="inline__content__card header__card view__mode">
      <div className="inline__card__header">
        <h5>Header</h5>
      </div>
      <div className="inline__card__content">
        <div className="content__display">
          <div className="content__field">
            <label>Text:</label>
            <span className="content__text">
              {headerText || "No header text set"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderContentCard;
