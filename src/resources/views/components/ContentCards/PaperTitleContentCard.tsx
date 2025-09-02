import React, { useEffect, useState } from "react";
import { usePaperBoard } from "app/Context/PaperBoardContext";
import { ContentBlock } from "@/resources/views/crud/DocumentTemplateBuilder";
import { SheetProps } from "../../pages/DocumentTemplateContent";
import TextInput from "../forms/TextInput";
import Button from "../forms/Button";

interface PaperTitleContentCardProps {
  item: ContentBlock;
  onClose: () => void;
  isEditing: boolean;
}

export interface PaperTitleContent {
  title: string;
  tagline: string;
}

const PaperTitleContentCard: React.FC<PaperTitleContentCardProps> = ({
  item,
  onClose,
  isEditing,
}) => {
  const { state, actions } = usePaperBoard();
  const [paperTitle, setPaperTitle] = useState<PaperTitleContent>({
    title: "",
    tagline: "Purpose",
  });

  const handleSave = () => {
    const updatedItem = {
      ...item,
      content: {
        id: item.id,
        order: item.order,
        paper_title: {
          title: paperTitle.title,
          tagline: paperTitle.tagline,
        },
      } as SheetProps,
    };

    const newBody = state.body.map((bodyItem) =>
      bodyItem.id === item.id ? updatedItem : bodyItem
    );

    actions.setBody(newBody);
    onClose();
  };

  useEffect(() => {
    if (item.content?.paper_title) {
      const paperTitle = item.content.paper_title as PaperTitleContent;
      setPaperTitle({
        title: paperTitle.title,
        tagline: paperTitle.tagline,
      });
    }
  }, [item]);

  if (isEditing) {
    return (
      <div className="inline__content__card paper__title__card">
        <div className="inline__card__header">
          <h5>Paper Title Configuration</h5>
        </div>
        <div className="inline__card__content">
          <TextInput
            type="text"
            label="Tagline"
            name="tagline"
            placeholder="Enter tagline..."
            value={paperTitle.tagline}
            onChange={(e) =>
              setPaperTitle({ ...paperTitle, tagline: e.target.value })
            }
          />
          <TextInput
            type="text"
            label="Title"
            name="title"
            value={paperTitle.title}
            onChange={(e) =>
              setPaperTitle({ ...paperTitle, title: e.target.value })
            }
            size="xl"
            placeholder="Enter title..."
          />
          <div className="inline__card__actions">
            <Button
              label="Cancel"
              type="button"
              handleClick={onClose}
              size="sm"
              variant="outline"
            />
            <Button
              label="Save Changes"
              type="button"
              handleClick={handleSave}
              size="sm"
              variant="success"
              icon="ri-save-line"
            />
          </div>
        </div>
      </div>
    );
  }

  // View mode
  return (
    <div className="document__content__view flex column">
      <span
        className="document__content__text"
        style={{
          fontSize: ".72rem",
          textTransform: "uppercase",
          letterSpacing: "0.2em",
          fontWeight: "700",
          color: "green",
        }}
      >
        {paperTitle.tagline || "Purpose"}:
      </span>
      <h4 className="document__content__text">
        {paperTitle.title || "No title set"}
      </h4>
    </div>
  );
};

export default PaperTitleContentCard;
