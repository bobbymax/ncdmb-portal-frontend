import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ContentAreaProps,
  OptionsContentAreaProps,
  ResourceComputations,
  ResourceFetchType,
  ResourceFilterTypes,
} from "app/Hooks/useBuilder";
import {
  EventContent,
  InvoiceContent,
  MilestoneContent,
  ParagraphContent,
  SignatureContent,
  TableContent,
} from "./ContentBlockView";
import { ResourcesList } from "../builders/DynamicTableBuilder";
import { BaseResponse } from "@/app/Repositories/BaseRepository";
import { BlockDataTypeMap, blockFormMap } from ".";
import { BlockDataType } from "@/app/Repositories/Block/data";
import Button from "resources/views/components/forms/Button";
import { ConfigState } from "../../ContentBuilder";

const ContentEditor = ({
  content,
  modify,
  block,
  resource,
  onRemove,
  configState,
}: {
  resource: BaseResponse | null;
  block: ContentAreaProps;
  content: OptionsContentAreaProps;
  modify: <T extends BlockDataType>(
    data: BlockDataTypeMap[T],
    identifier: keyof OptionsContentAreaProps,
    blockId: string | number
  ) => void;
  onRemove?: (blockId: string) => void;
  configState: ConfigState;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localContentState, setLocalContentState] =
    useState<OptionsContentAreaProps>({} as OptionsContentAreaProps);

  // Update local state when content prop changes, but avoid infinite loops
  useEffect(() => {
    if (content && Object.keys(content).length > 0) {
      setLocalContentState((prev) => {
        // Only update if content is actually different from current state
        const contentString = JSON.stringify(content);
        const prevString = JSON.stringify(prev);

        if (contentString !== prevString) {
          return content;
        }
        return prev;
      });
    }
  }, [content]);

  const handleSave = () => {
    console.log("ContentEditor handleSave called with:", {
      localContentState,
      blockType: block.type,
      blockId: block.id,
    });

    // Propagate changes to parent
    modify(
      localContentState as OptionsContentAreaProps,
      block.type as keyof OptionsContentAreaProps,
      block.id
    );
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset local state to original content
    setLocalContentState(content);
    setIsEditing(false);
  };

  // config('site.budget_year')

  const updateContentState = useCallback(
    <K extends BlockDataType>(
      data: BlockDataTypeMap[K],
      identifier: keyof OptionsContentAreaProps
    ) => {
      setLocalContentState((prev) => {
        const prevValue = prev[identifier];
        let newValue: any;
        if (
          typeof prevValue === "object" &&
          prevValue !== null &&
          typeof data === "object" &&
          data !== null
        ) {
          newValue = { ...prevValue, ...data };
        } else if (typeof data === "object" && data !== null) {
          newValue = { ...data };
        } else {
          newValue = data;
        }
        return {
          ...prev,
          [identifier]: newValue,
        };
      });
    },
    []
  );

  const MemoBlockForm: JSX.Element | null = useMemo(() => {
    if (!localContentState) return null;

    const Component = blockFormMap[block.type];
    return Component ? (
      <Component
        resource={resource}
        configState={configState}
        localContentState={localContentState}
        updateLocal={updateContentState}
      />
    ) : null;
  }, [localContentState, block.type, resource, updateContentState]);

  const renderCard = (param: keyof OptionsContentAreaProps) => {
    switch (param) {
      case "paragraph":
        return (
          <ParagraphContent
            title={localContentState.title}
            tagline={localContentState.tagline}
            body={localContentState.paragraph?.body || ""}
          />
        );
      case "table":
        return (
          <TableContent
            title={localContentState.title}
            tagline={localContentState.tagline}
            headers={localContentState.table?.headers || []}
            rows={localContentState.table?.rows || []}
            filter={localContentState.table?.filter as ResourceFilterTypes}
            compute={localContentState.table?.compute as ResourceComputations}
            type={localContentState.table?.type as ResourceFetchType}
            source={localContentState.table?.source as ResourcesList}
          />
        );
      case "event":
        return (
          <EventContent
            name={localContentState.event?.name || ""}
            venue={localContentState.event?.venue || ""}
            start_date={localContentState.event?.start_date || ""}
            end_date={localContentState.event?.end_date || ""}
            start_time={localContentState.event?.start_time || ""}
            address={localContentState.event?.address || ""}
            location={localContentState.event?.location || ""}
            type={localContentState.event?.type || "local"}
            country={localContentState.event?.country || ""}
            currency={localContentState.event?.currency || "NGN"}
            estacode={localContentState.event?.estacode || "USD"}
            source={localContentState.event?.source}
            vendor_name={localContentState.event?.vendor_name || ""}
          />
        );
      case "approval":
        return (
          <SignatureContent
            approvals={localContentState.approval?.approvals || []}
            style={localContentState.approval?.style || "basic"}
            max_signatures={localContentState.approval?.max_signatures || 6}
            originator_id={localContentState.approval?.originator_id || 0}
            originator_name={localContentState.approval?.originator_name || ""}
            originator_department_id={
              localContentState.approval?.originator_department_id || 0
            }
          />
        );
      case "milestone":
        return (
          <MilestoneContent
            project={localContentState.milestone?.project}
            milestones={localContentState.milestone?.milestones || []}
          />
        );
      case "invoice":
        return (
          <InvoiceContent
            invoice={localContentState.invoice?.invoice || null}
            project={localContentState.invoice?.project || null}
            items={localContentState.invoice?.items || []}
            sub_total={localContentState.invoice?.sub_total || 0}
            total={localContentState.invoice?.total || 0}
            vat={localContentState.invoice?.vat || 0}
            service_charge={localContentState.invoice?.service_charge || 0}
            markup={localContentState.invoice?.markup || 0}
            currency={localContentState.invoice?.currency || "NGN"}
          />
        );
      default:
        return <div>Unsupported content type</div>;
    }
  };

  return (
    <div className="card__block__container">
      <div className="card__block__header flex align between">
        <div
          className="header__draggable flex align gap-sm"
          style={{
            cursor: "pointer",
          }}
        >
          <i
            className="ri-drag-move-line"
            style={{
              color: "white",
              cursor: "grab",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.cursor = "grabbing")}
            onMouseLeave={(e) => (e.currentTarget.style.cursor = "grab")}
          />
          <small>{block.type}</small>
        </div>
        <div className="header__actions flex align gap-sm">
          <i
            className="ri-settings-3-line"
            onClick={() => setIsEditing(true)}
            style={{
              color: "white",
              cursor: "pointer",
              fontSize: "16px",
            }}
          />
          <i
            className="ri-subtract-line"
            onClick={() => {
              if (onRemove) {
                onRemove(block.id);
              }
            }}
            style={{
              color: "white",
              cursor: "pointer",
              fontSize: "16px",
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
        <p className="mb-3 header__title">{block.type}</p>
        {MemoBlockForm}
        <div className="col-md-12 mb-3 flex end align gap-sm">
          <Button
            label="Cancel"
            icon="ri-close-line"
            handleClick={handleCancel}
            variant="dark"
            size="sm"
          />
          <Button
            label="Save"
            icon="ri-send-plane-fill"
            handleClick={handleSave}
            variant="success"
            size="sm"
          />
        </div>
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
