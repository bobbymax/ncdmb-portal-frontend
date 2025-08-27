import React, { useState } from "react";
import { usePaperBoard } from "app/Context/PaperBoardContext";
import { ContentBlock } from "@/resources/views/crud/DocumentTemplateBuilder";

interface ListContentCardProps {
  item: ContentBlock;
  onClose: () => void;
  isEditing: boolean;
}

const ListContentCard: React.FC<ListContentCardProps> = ({
  item,
  onClose,
  isEditing,
}) => {
  const { state, actions } = usePaperBoard();
  const [listData, setListData] = useState("");

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
        text: undefined,
        table: undefined,
        list: listData,
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
      <div className="inline__content__card list__card">
        <div className="inline__card__header">
          <h5>List Configuration</h5>
        </div>
        <div className="inline__card__content">
          <div className="form__group">
            <label>List Items (one per line)</label>
            <textarea
              value={listData}
              onChange={(e) => setListData(e.target.value)}
              placeholder="Enter list items, one per line..."
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
    <div className="inline__content__card list__card view__mode">
      <div className="inline__card__header">
        <h5>List</h5>
      </div>
      <div className="inline__card__content">
        <div className="content__display">
          <div className="content__field">
            <label>Items:</label>
            <span className="content__text">
              {listData || "No list items set"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListContentCard;
