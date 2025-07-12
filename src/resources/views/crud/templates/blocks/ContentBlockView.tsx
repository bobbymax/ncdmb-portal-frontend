import {
  EventContentAreaProps,
  OptionsContentAreaProps,
  ParagraphContentAreaProps,
  ResourceComputations,
  ResourceFetchType,
  ResourceFilterTypes,
  SignatureContentAreaProps,
  TableContentAreaProps,
} from "app/Hooks/useBuilder";
import React, { useMemo } from "react";
import DynamicTableBuilder, {
  ResourcesList,
} from "../builders/DynamicTableBuilder";
import moment from "moment";
import SignatureCanvas from "resources/views/components/capsules/SignatureCanvas";

export const ParagraphContent: React.FC<
  ParagraphContentAreaProps & { title?: string; tagline?: string }
> = ({ title, tagline, body }) => {
  return (
    <div className="paragraph__container mb-4">
      <h4 className="mb-2">{title}</h4>
      <small>{tagline}</small>
      <p dangerouslySetInnerHTML={{ __html: body }} />
    </div>
  );
};

export const TableContent: React.FC<
  TableContentAreaProps & { title?: string; tagline?: string }
> = ({ title, tagline, filter, compute, source, type, headers, rows }) => {
  return (
    <div className="dynamic__table mb-4">
      <DynamicTableBuilder headers={headers} rows={rows} />
    </div>
  );
};

export const SignatureContent: React.FC<SignatureContentAreaProps> = ({
  approvals,
  style,
  max_signatures,
  originator_id,
  originator_name,
  originator_department_id,
}) => {
  return (
    <div
      className={`signature__layer flex align gap-md ${
        approvals.length === 2 ? "between" : ""
      }`}
    >
      {approvals.length > 0 ? (
        approvals.map((approval, idx) => (
          <div key={idx} className="signature__canvas__container flex column">
            <SignatureCanvas
              signatureUrl={approval?.meta_data?.signature || ""}
            />
            <div className="line mb-3"></div>
            <p>{approval.approver?.label || ""}</p>
          </div>
        ))
      ) : (
        <div className="signature__placeholder">
          <p>No Signature here</p>
        </div>
      )}
    </div>
  );
};

export const EventContent: React.FC<EventContentAreaProps> = ({
  name,
  venue,
  start_date,
  end_date,
  start_time,
  address,
  location,
  type,
  country,
  currency,
  estacode,
  source,
  vendor_name,
}) => {
  return (
    <div className="event__card flex column gap-md mb-4 mt-5">
      <div className="top__head flex align gap-md">
        <i className="ri-calendar-2-line" />
        <div className="diiiiits" style={{ lineHeight: 1 }}>
          <h5 style={{ fontSize: 15 }}>{name}</h5>
          <small>
            {venue} - From: {moment(start_date).format("ll")} | To:{" "}
            {moment(end_date).format("ll")} - Time:{" "}
            {moment(start_time, "HH:mm").format("h:mm A")}
          </small>
        </div>
      </div>
      <div className="mid__secch flex align gap-md">
        <i className="ri-map-pin-line" />
        <p>{address}</p>
      </div>
    </div>
  );
};

const ContentBlockView = ({
  content,
}: {
  content: OptionsContentAreaProps;
}) => {
  const objectKeys = useMemo(
    () => Object.keys(content) as (keyof OptionsContentAreaProps)[],
    [content]
  );

  console.log("Content Block View", content);

  const renderCard = (param: keyof OptionsContentAreaProps) => {
    switch (param) {
      case "paragraph":
        return (
          <ParagraphContent
            title={content.title}
            tagline={content.tagline}
            body={content.paragraph?.body || ""}
          />
        );
      case "table":
        return (
          <TableContent
            title={content.title}
            tagline={content.tagline}
            headers={content.table?.headers || []}
            rows={content.table?.rows || []}
            filter={content.table?.filter as ResourceFilterTypes}
            compute={content.table?.compute as ResourceComputations}
            type={content.table?.type as ResourceFetchType}
            source={content.table?.source as ResourcesList}
          />
        );
      case "event":
        return (
          <EventContent
            name={content.event?.name || ""}
            venue={content.event?.venue || ""}
            start_date={content.event?.start_date || ""}
            end_date={content.event?.end_date || ""}
            start_time={content.event?.start_time || ""}
            address={content.event?.address || ""}
            location={content.event?.location || ""}
            type={content.event?.type || "local"}
            country={content.event?.country || ""}
            currency={content.event?.currency || "NGN"}
            estacode={content.event?.estacode || "USD"}
            source={content.event?.source}
            vendor_name={content.event?.vendor_name || ""}
          />
        );
      case "approval":
        return (
          <SignatureContent
            approvals={content.approval?.approvals || []}
            style={content.approval?.style || "basic"}
            max_signatures={content.approval?.max_signatures || 6}
            originator_id={content.approval?.originator_id || 0}
            originator_name={content.approval?.originator_name || ""}
            originator_department_id={
              content.approval?.originator_department_id || 0
            }
          />
        );
      default:
        return <div>Unsupported content type</div>;
    }
  };

  return (
    <div className="template__view__page">
      {content &&
        objectKeys.length > 0 &&
        objectKeys.map((param, ix) => (
          <div key={ix} className="content-block-view">
            {renderCard(param)}
          </div>
        ))}
    </div>
  );
};

export default ContentBlockView;
