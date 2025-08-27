import React from "react";
import { ContentBlock } from "@/resources/views/crud/DocumentTemplateBuilder";
import { DeskComponentPropTypes } from "@/resources/views/pages/DocumentTemplateContent";
import {
  PaperTitleContentCard,
  ParagraphContentCard,
  TextContentCard,
  TableContentCard,
  ListContentCard,
  HeaderContentCard,
  EventContentCard,
  ExpenseContentCard,
  InvoiceContentCard,
  RequisitionContentCard,
  SignatureContentCard,
} from "./index";

interface InlineContentCardProps {
  item: ContentBlock;
  onClose: () => void;
  isEditing: boolean;
  dependencies?: unknown;
}

const InlineContentCard: React.FC<InlineContentCardProps> = ({
  item,
  onClose,
  isEditing,
  dependencies = null,
}) => {
  // Determine the type from the item's type property
  const getItemType = (): DeskComponentPropTypes => {
    return item.type || "text";
  };

  const itemType = getItemType();

  // Render the appropriate ContentCard based on type
  switch (itemType) {
    case "paper_title":
      return (
        <PaperTitleContentCard
          item={item}
          onClose={onClose}
          isEditing={isEditing}
        />
      );
    case "paragraph":
      return (
        <ParagraphContentCard
          item={item}
          onClose={onClose}
          isEditing={isEditing}
        />
      );
    case "text":
      return (
        <TextContentCard item={item} onClose={onClose} isEditing={isEditing} />
      );
    case "table":
      return (
        <TableContentCard item={item} onClose={onClose} isEditing={isEditing} />
      );
    case "list":
      return (
        <ListContentCard item={item} onClose={onClose} isEditing={isEditing} />
      );
    case "header":
      return (
        <HeaderContentCard
          item={item}
          onClose={onClose}
          isEditing={isEditing}
        />
      );
    case "event":
      return (
        <EventContentCard item={item} onClose={onClose} isEditing={isEditing} />
      );
    case "expense":
      return (
        <ExpenseContentCard
          item={item}
          onClose={onClose}
          isEditing={isEditing}
          dependencies={dependencies as unknown}
        />
      );
    case "invoice":
      return (
        <InvoiceContentCard
          item={item}
          onClose={onClose}
          isEditing={isEditing}
        />
      );
    case "requisition":
      return (
        <RequisitionContentCard
          item={item}
          onClose={onClose}
          isEditing={isEditing}
        />
      );
    case "signature":
      return (
        <SignatureContentCard
          item={item}
          onClose={onClose}
          isEditing={isEditing}
        />
      );
    default:
      return (
        <TextContentCard item={item} onClose={onClose} isEditing={isEditing} />
      );
  }
};

export default InlineContentCard;
