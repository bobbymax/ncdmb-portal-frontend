import React, { useEffect, useState } from "react";
import { usePaperBoard } from "app/Context/PaperBoardContext";
import { ContentBlock } from "@/resources/views/crud/DocumentTemplateBuilder";
import { SheetProps } from "../../pages/DocumentTemplateContent";

interface HeaderContentCardProps {
  item: ContentBlock;
  onClose: () => void;
  isEditing: boolean;
}

const getHeaderValue = (value: unknown): string =>
  typeof value === "string" ? value : "";

const HeaderContentCard: React.FC<HeaderContentCardProps> = ({
  item,
  onClose,
  isEditing,
}) => {
  const { state, actions } = usePaperBoard();
  const [headerText, setHeaderText] = useState(
    getHeaderValue(item.content?.header)
  );

  useEffect(() => {
    if (isEditing) {
      setHeaderText(getHeaderValue(item.content?.header));
    }
  }, [isEditing, item.content?.header]);

  const handleSave = () => {
    const updatedItem = {
      ...item,
      content: {
        id: item.id,
        order: item.order,
        header: headerText,
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
    <div className="inline__card__content">
      <h5 style={{ textTransform: "capitalize", color: "green" }}>
        {getHeaderValue(item.content?.header) || "No header text set"}
      </h5>
    </div>
  );
};

export default HeaderContentCard;
