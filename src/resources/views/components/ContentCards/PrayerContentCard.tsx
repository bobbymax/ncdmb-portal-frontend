import React, { useEffect, useState } from "react";
import { usePaperBoard } from "app/Context/PaperBoardContext";
import { ContentBlock } from "@/resources/views/crud/DocumentTemplateBuilder";
import { SheetProps } from "resources/views/pages/DocumentTemplateContent";

interface PrayerContentCardProps {
  item: ContentBlock;
  onClose: () => void;
  isEditing: boolean;
}

const getPrayerValue = (value: unknown): string =>
  typeof value === "string" ? value : "";

const PrayerContentCard: React.FC<PrayerContentCardProps> = ({
  item,
  onClose,
  isEditing,
}) => {
  const { state, actions } = usePaperBoard();
  const [prayer, setPrayer] = useState<string>(
    getPrayerValue(item.content?.prayer)
  );

  useEffect(() => {
    if (isEditing) {
      setPrayer(getPrayerValue(item.content?.prayer));
    }
  }, [isEditing, item]);

  const handleSave = () => {
    const updatedItem = {
      ...item,
      content: {
        id: item.id,
        order: item.order,
        prayer,
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
      <div className="inline__content__card prayer__card">
        <div className="inline__card__header">
          <h5>Prayer Configuration</h5>
        </div>
        <div className="inline__card__content">
          <div className="form__group">
            <label>Prayer Content</label>
            <textarea
              value={prayer}
              onChange={(e) => setPrayer(e.target.value)}
              placeholder="Enter prayer content..."
              className="form__textarea"
              rows={4}
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

  return (
    <div className="inline__content__card prayer__card view__mode">
      <div className="inline__card__header">
        <h5>Prayer</h5>
      </div>
      <div className="inline__card__content">
        <div className="content__display">
          <div className="content__field">
            <p className="prayer__content">
              {getPrayerValue(item.content?.prayer) ||
                "No prayer content set"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrayerContentCard;

