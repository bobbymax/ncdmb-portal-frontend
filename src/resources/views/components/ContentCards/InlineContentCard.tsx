import React from "react";
import { ContentBlock } from "@/resources/views/crud/DocumentTemplateBuilder";
import { DeskComponentPropTypes } from "resources/views/pages/DocumentTemplateContent";
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
  PaymentBatchContentCard,
} from "./index";
import { ContextType } from "app/Context/PaperBoardContext";
import { CategoryProgressTrackerProps } from "@/app/Repositories/DocumentCategory/data";
import { SelectedActionsProps } from "../../crud/DocumentCategoryConfiguration";
import { UserResponseData } from "@/app/Repositories/User/data";
import { scopes } from "app/Hooks/usePolicy";

interface InlineContentCardProps {
  item: ContentBlock;
  onClose: () => void;
  isEditing: boolean;
  currentTracker: CategoryProgressTrackerProps | null;
  dependencies?: unknown;
  currentPageActions: SelectedActionsProps[];
  uplines: (
    scope?: keyof typeof scopes,
    flag?: "group" | "grade",
    group_id?: number
  ) => UserResponseData[];
}

const InlineContentCard: React.FC<InlineContentCardProps> = ({
  item,
  onClose,
  isEditing,
  currentTracker,
  dependencies = null,
  currentPageActions,
  uplines,
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
          currentTracker={currentTracker}
          currentPageActions={currentPageActions}
          uplines={uplines}
        />
      );
    case "payment_batch":
      return (
        <PaymentBatchContentCard
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
