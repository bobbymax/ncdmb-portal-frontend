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

interface ContentCardFactoryProps {
  item: ContentBlock;
  onClose: () => void;
  isEditing?: boolean;
  dependencies?: unknown;
}

const ContentCardFactory: React.FC<ContentCardFactoryProps> = ({
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
          isEditing={isEditing || false}
        />
      );
    case "paragraph":
      return (
        <ParagraphContentCard
          item={item}
          onClose={onClose}
          isEditing={isEditing || false}
        />
      );
    case "text":
      return (
        <TextContentCard
          item={item}
          onClose={onClose}
          isEditing={isEditing || false}
        />
      );
    case "table":
      return (
        <TableContentCard
          item={item}
          onClose={onClose}
          isEditing={isEditing || false}
        />
      );
    case "list":
      return (
        <ListContentCard
          item={item}
          onClose={onClose}
          isEditing={isEditing || false}
        />
      );
    case "header":
      return (
        <HeaderContentCard
          item={item}
          onClose={onClose}
          isEditing={isEditing || false}
        />
      );
    case "event":
      return (
        <EventContentCard
          item={item}
          onClose={onClose}
          isEditing={isEditing || false}
        />
      );
    case "expense":
      return (
        <ExpenseContentCard
          item={item}
          onClose={onClose}
          isEditing={isEditing || false}
          dependencies={dependencies}
        />
      );
    case "invoice":
      return (
        <InvoiceContentCard
          item={item}
          onClose={onClose}
          isEditing={isEditing || false}
        />
      );
    case "requisition":
      return (
        <RequisitionContentCard
          item={item}
          onClose={onClose}
          isEditing={isEditing || false}
        />
      );
    case "signature":
      return (
        <SignatureContentCard
          item={item}
          onClose={onClose}
          isEditing={isEditing || false}
        />
      );
    default:
      return (
        <TextContentCard
          item={item}
          onClose={onClose}
          isEditing={isEditing || false}
        />
      );
  }
};

export default ContentCardFactory;
