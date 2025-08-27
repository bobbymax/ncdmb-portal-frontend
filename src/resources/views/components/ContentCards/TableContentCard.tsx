import React, { useState } from "react";
import { usePaperBoard } from "app/Context/PaperBoardContext";
import { ContentBlock } from "@/resources/views/crud/DocumentTemplateBuilder";

interface TableContentCardProps {
  item: ContentBlock;
  onClose: () => void;
  isEditing: boolean;
}

const TableContentCard: React.FC<TableContentCardProps> = ({
  item,
  onClose,
  isEditing,
}) => {
  const { state, actions } = usePaperBoard();
  const [tableData, setTableData] = useState("");

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
        table: tableData,
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
      <div className="inline__content__card table__card">
        <div className="inline__card__header">
          <h5>Table Configuration</h5>
        </div>
        <div className="inline__card__content">
          <div className="form__group">
            <label>Table Data</label>
            <textarea
              value={tableData}
              onChange={(e) => setTableData(e.target.value)}
              placeholder="Enter table data or configuration..."
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
    <div className="inline__content__card table__card view__mode">
      <div className="inline__card__header">
        <h5>Table</h5>
      </div>
      <div className="inline__card__content">
        <div className="content__display">
          <div className="content__field">
            <label>Data:</label>
            <span className="content__text">
              {tableData || "No table data set"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableContentCard;
