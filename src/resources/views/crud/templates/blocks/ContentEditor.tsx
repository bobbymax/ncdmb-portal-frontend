import React, { useMemo, useState } from "react";
import {
  ContentAreaProps,
  OptionsContentAreaProps,
  ResourceComputations,
  ResourceFetchType,
  ResourceFilterTypes,
} from "app/Hooks/useBuilder";
import {
  EventContent,
  ExpenseContent,
  InvoiceContent,
  MilestoneContent,
  ParagraphContent,
  SignatureContent,
  TableContent,
  TitleContent,
} from "./ContentBlockView";
import { ResourcesList } from "../builders/DynamicTableBuilder";
import { BaseResponse } from "@/app/Repositories/BaseRepository";
import BlockForm from "./BlockForm";
import { useTemplateBoard } from "app/Context/TemplateBoardContext";

const ContentEditor = ({
  block,
  resource,
}: {
  resource: BaseResponse | null;
  block: ContentAreaProps;
}) => {
  const { state, actions } = useTemplateBoard();
  const [isEditing, setIsEditing] = useState(false);

  // Get content from global context
  const globalContent = state.contents.find(
    (content) => content.id === block.id
  )?.content as OptionsContentAreaProps;

  const MemoBlockForm = useMemo(() => {
    return (
      <BlockForm
        block={block}
        resource={resource}
        onSave={() => setIsEditing(false)}
        onCancel={() => setIsEditing(false)}
      />
    );
  }, [block, resource]);

  const renderCard = (param: keyof OptionsContentAreaProps) => {
    // Use globalContent for display (source of truth)
    const displayContent = globalContent;

    switch (param) {
      case "paragraph":
        return (
          <ParagraphContent
            title={displayContent.title}
            tagline={displayContent.tagline}
            body={displayContent.paragraph?.body || ""}
            blockId={block.id}
          />
        );
      case "table":
        return (
          <TableContent
            title={displayContent.title}
            tagline={displayContent.tagline}
            headers={displayContent.table?.headers || []}
            rows={displayContent.table?.rows || []}
            filter={displayContent.table?.filter as ResourceFilterTypes}
            compute={displayContent.table?.compute as ResourceComputations}
            type={displayContent.table?.type as ResourceFetchType}
            source={displayContent.table?.source as ResourcesList}
            blockId={block.id}
          />
        );
      case "event":
        return (
          <EventContent
            name={displayContent.event?.name || ""}
            venue={displayContent.event?.venue || ""}
            start_date={displayContent.event?.start_date || ""}
            end_date={displayContent.event?.end_date || ""}
            start_time={displayContent.event?.start_time || ""}
            address={displayContent.event?.address || ""}
            location={displayContent.event?.location || ""}
            type={displayContent.event?.type || "local"}
            country={displayContent.event?.country || ""}
            currency={displayContent.event?.currency || "NGN"}
            estacode={displayContent.event?.estacode || "USD"}
            source={displayContent.event?.source}
            vendor_name={displayContent.event?.vendor_name || ""}
            blockId={block.id}
          />
        );
      case "approval":
        return (
          <SignatureContent
            approvals={displayContent.approval?.approvals || []}
            style={displayContent.approval?.style || "basic"}
            max_signatures={displayContent.approval?.max_signatures || 6}
            originator_id={displayContent.approval?.originator_id || 0}
            originator_name={displayContent.approval?.originator_name || ""}
            originator_department_id={
              displayContent.approval?.originator_department_id || 0
            }
            blockId={block.id}
          />
        );
      case "milestone":
        return (
          <MilestoneContent
            project={displayContent.milestone?.project}
            milestones={displayContent.milestone?.milestones || []}
            blockId={block.id}
          />
        );
      case "invoice":
        return (
          <InvoiceContent
            invoice={displayContent.invoice?.invoice || null}
            project={displayContent.invoice?.project || null}
            items={displayContent.invoice?.items || []}
            sub_total={displayContent.invoice?.sub_total || 0}
            total={displayContent.invoice?.total || 0}
            vat={displayContent.invoice?.vat || 0}
            service_charge={displayContent.invoice?.service_charge || 0}
            markup={displayContent.invoice?.markup || 0}
            currency={displayContent.invoice?.currency || "NGN"}
            blockId={block.id}
          />
        );
      case "expense":
        return (
          <ExpenseContent
            loaded_type={displayContent.expense?.loaded_type || "claim"}
            expenses={displayContent.expense?.expenses || []}
            claimState={displayContent.expense?.claimState || null}
            headers={displayContent.expense?.headers || []}
            blockId={block.id}
          />
        );
      case "paper_title":
        return (
          <TitleContent
            title={displayContent.paper_title?.title || ""}
            blockId={block.id}
          />
        );
      default:
        return <div>Unsupported content type</div>;
    }
  };

  return (
    <div className="card__block__container">
      <div className="card__block__header flex align between">
        <div className="header__draggable flex align gap-sm">
          <i className="ri-drag-move-line" />
          <small>{block.type}</small>
        </div>
        <div className="header__actions flex align gap-sm">
          <i
            className="ri-settings-3-line"
            onClick={() => setIsEditing(true)}
            title="Edit block"
          />
          <i
            className="ri-subtract-line"
            onClick={() => {
              actions.removeContent(block.id);
            }}
            title="Remove block"
          />
        </div>
      </div>

      {/* Edit Form - Always rendered but conditionally displayed */}
      <div
        className="block__form__container"
        style={{ display: isEditing ? "block" : "none" }}
      >
        {MemoBlockForm}
      </div>

      {/* View Content - Always rendered but conditionally displayed */}
      <div
        className="card__block__body"
        style={{ display: isEditing ? "none" : "block" }}
      >
        {renderCard(block.type as keyof OptionsContentAreaProps)}
      </div>
    </div>
  );
};

export default ContentEditor;
