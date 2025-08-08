import {
  EventContentAreaProps,
  ExpenseContentProps,
  InvoiceContentAreaProps,
  MilestoneContentAreaProps,
  OptionsContentAreaProps,
  ParagraphContentAreaProps,
  ResourceComputations,
  ResourceFetchType,
  ResourceFilterTypes,
  SignatureContentAreaProps,
  SignaturePadGroupProps,
  TableContentAreaProps,
  TitleContentProps,
} from "app/Hooks/useBuilder";
import React, { useEffect, useMemo, useState } from "react";
import DynamicTableBuilder, {
  ResourcesList,
} from "../builders/DynamicTableBuilder";
import moment from "moment";
import SignatureCanvas from "resources/views/components/capsules/SignatureCanvas";
import {
  formatCurrency,
  generateApprovalsFromConfig,
} from "app/Support/Helpers";
import { ConfigState } from "app/Hooks/useTemplateHeader";
import { ExpenseResponseData } from "@/app/Repositories/Expense/data";
import { useTemplateBoard } from "app/Context/TemplateBoardContext";
import { ColumnData } from "@/resources/views/components/tables/CustomDataTable";

export const ParagraphContent: React.FC<
  ParagraphContentAreaProps & {
    title?: string;
    tagline?: string;
    isPreview?: boolean;
    blockId?: string;
  }
> = ({ title, tagline, body, isPreview = true, blockId }) => {
  const { state } = useTemplateBoard();

  // Get content from global state if blockId is provided
  const globalContent = blockId
    ? state.contents.find((content) => content.block_id === Number(blockId))
        ?.content?.paragraph
    : null;
  const displayBody = globalContent?.body || body;

  return isPreview ? (
    <div className="paragraph__container mb-4">
      <h4 className="mb-2">{title}</h4>
      <small>{tagline}</small>
      <p dangerouslySetInnerHTML={{ __html: displayBody }} />
    </div>
  ) : (
    <div className="paragraph__container mb-4"></div>
  );
};

export const TableContent: React.FC<
  TableContentAreaProps & {
    title?: string;
    tagline?: string;
    isPreview?: boolean;
    blockId?: string;
  }
> = ({
  title,
  tagline,
  filter,
  compute,
  source,
  type,
  headers,
  rows,
  isPreview = true,
  blockId,
}) => {
  const { state } = useTemplateBoard();

  // Get content from global state if blockId is provided
  const globalContent = blockId
    ? state.contents.find((content) => content.block_id === Number(blockId))
        ?.content?.table
    : null;
  const displayHeaders = globalContent?.headers || headers;
  const displayRows = globalContent?.rows || rows;

  return (
    <div className="dynamic__table mb-4">
      <DynamicTableBuilder headers={displayHeaders} rows={displayRows} />
    </div>
  );
};

export const MilestoneContent: React.FC<
  MilestoneContentAreaProps & {
    isPreview?: boolean;
    blockId?: string;
  }
> = ({ project, milestones, isPreview = true, blockId }) => {
  const { state } = useTemplateBoard();

  // Get content from global state if blockId is provided
  const globalContent = blockId
    ? state.contents.find((content) => content.block_id === Number(blockId))
        ?.content?.milestone
    : null;
  const displayMilestones = globalContent?.milestones || milestones;
  const displayProject = globalContent?.project || project;

  return (
    <div className="milestone__container mb-4">
      <table className="table table-bordered table-striped">
        <thead>
          <tr>
            <th>Description</th>
            <th>Duration</th>
            <th>%</th>
          </tr>
        </thead>
        <tbody>
          {displayMilestones.map((milestone, idx) => (
            <tr key={idx}>
              <td>{milestone.description}</td>
              <td>{`${milestone.duration} ${milestone.frequency}`}</td>
              <td>{milestone.percentage_completion}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const SignatureContent: React.FC<
  SignatureContentAreaProps & {
    isPreview?: boolean;
    blockId?: string;
  }
> = ({
  approvals,
  style,
  max_signatures,
  originator_id,
  originator_name,
  originator_department_id,
  isPreview = true,
  blockId,
}) => {
  const { state } = useTemplateBoard();

  // Get content from global state if blockId is provided
  const globalContent = blockId
    ? state.contents.find((content) => content.block_id === Number(blockId))
        ?.content?.approval
    : null;
  const displayApprovals = globalContent?.approvals || approvals;
  const displayStyle = globalContent?.style || style;

  // console.log(approvals);

  return (
    <div
      className={`signature__layer flex align gap-md ${
        displayApprovals.length === 2 ? "between" : ""
      }`}
    >
      {displayApprovals.length > 0 ? (
        displayApprovals.map((approval, idx) => (
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

export const EventContent: React.FC<
  EventContentAreaProps & {
    isPreview?: boolean;
    blockId?: string;
  }
> = ({
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
  isPreview = true,
  blockId,
}) => {
  const { state } = useTemplateBoard();

  // Get content from global state if blockId is provided
  const globalContent = blockId
    ? state.contents.find((content) => content.block_id === Number(blockId))
        ?.content?.event
    : null;

  const displayName = globalContent?.name || name;
  const displayVenue = globalContent?.venue || venue;
  const displayStartDate = globalContent?.start_date || start_date;
  const displayEndDate = globalContent?.end_date || end_date;
  const displayStartTime = globalContent?.start_time || start_time;
  const displayAddress = globalContent?.address || address;

  return (
    <div className="event__card flex column gap-md mb-4 mt-5">
      <div className="top__head flex align gap-md">
        <i className="ri-calendar-2-line" />
        <div className="diiiiits" style={{ lineHeight: 1 }}>
          <h5 style={{ fontSize: 15 }}>{displayName}</h5>
          <small>
            {displayVenue} - From: {moment(displayStartDate).format("ll")} | To:{" "}
            {moment(displayEndDate).format("ll")} - Time:{" "}
            {moment(displayStartTime, "HH:mm").format("h:mm A")}
          </small>
        </div>
      </div>
      <div className="mid__secch flex align gap-md">
        <i className="ri-map-pin-line" />
        <p>{displayAddress}</p>
      </div>
    </div>
  );
};

export const InvoiceContent: React.FC<
  InvoiceContentAreaProps & {
    isPreview?: boolean;
    blockId?: string;
  }
> = ({
  invoice,
  isPreview = true,
  markup,
  currency,
  vat,
  service_charge,
  total,
  sub_total,
  blockId,
}) => {
  const { state } = useTemplateBoard();

  // Get content from global state if blockId is provided
  const globalContent = blockId
    ? state.contents.find((content) => content.block_id === Number(blockId))
        ?.content?.invoice
    : null;
  const displayInvoice = globalContent?.invoice || invoice;
  const displayItems = globalContent?.items || displayInvoice?.items || [];
  const displaySubTotal = globalContent?.sub_total || sub_total;
  const displayTotal = globalContent?.total || total;
  const displayVat = globalContent?.vat || vat;
  const displayServiceCharge = globalContent?.service_charge || service_charge;
  const displayMarkup = globalContent?.markup || markup;
  const displayCurrency = globalContent?.currency || currency;

  return (
    <div className="milestone__container mb-4">
      <table className="table table-bordered table-striped">
        <thead>
          <tr>
            <th>Description</th>
            <th>QTY</th>
            <th>Unit Price</th>
            <th>Total Amount</th>
          </tr>
        </thead>
        <tbody>
          {displayItems.map((item, idx) => (
            <tr key={idx}>
              <td>{item.description}</td>
              <td>{item.qty}</td>
              <td>{formatCurrency(item.unit_price)}</td>
              <td>{formatCurrency(item.total_amount)}</td>
            </tr>
          ))}
          <tr>
            <td colSpan={3} className="table__data__value">
              Sub Total:
            </td>
            <td className="table__data__value">
              {formatCurrency(displaySubTotal)}
            </td>
          </tr>
          {displayMarkup > 0 && (
            <tr>
              <td colSpan={3} className="table__data__value">
                Service Charge ({displayMarkup}%):
              </td>
              <td className="table__data__value">
                {formatCurrency(displayServiceCharge)}
              </td>
            </tr>
          )}
          <tr>
            <td colSpan={3} className="table__data__value">
              VAT (7.5%):
            </td>
            <td className="table__data__value">{formatCurrency(displayVat)}</td>
          </tr>
          <tr>
            <td colSpan={3} className="table__data__value">
              Total:
            </td>
            <td className="table__data__value">
              {formatCurrency(displayTotal)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export const ExpenseContent: React.FC<
  ExpenseContentProps & {
    isPreview?: boolean;
    blockId?: string;
  }
> = React.memo(
  ({
    loaded_type,
    isPreview = true,
    expenses,
    claimState,
    headers,
    blockId,
  }) => {
    const { state } = useTemplateBoard();
    const [isLoading, setIsLoading] = useState(false);
    const [displayedExpenses, setDisplayedExpenses] = useState(expenses);

    // Get content from global state if blockId is provided
    const globalContent = blockId
      ? state.contents.find((content) => content.id === blockId)?.content
          ?.expense
      : null;

    const globalExpenses = globalContent?.expenses || expenses;
    const globalHeaders = [
      {
        accessor: "start_date",
        label: "Duration",
        type: "date",
      },
      {
        accessor: "description",
        label: "Narration",
        type: "text",
      },
      {
        accessor: "total_amount_spent",
        label: "Spent",
        type: "currency",
      },
    ] as ColumnData[];

    // Handle loading state when expenses change
    useEffect(() => {
      if (
        JSON.stringify(globalExpenses) !== JSON.stringify(displayedExpenses)
      ) {
        setIsLoading(true);

        // Simulate loading time
        const timer = setTimeout(() => {
          setDisplayedExpenses(globalExpenses);
          setIsLoading(false);
        }, 800);

        return () => clearTimeout(timer);
      }
    }, [globalExpenses, displayedExpenses]);

    return (
      <div className="expense__container mb-4">
        <h5>Expenses</h5>

        {isLoading ? (
          <div className="expense__loading">
            <div className="loading__spinner">
              <i className="ri-loader-4-line"></i>
            </div>
            <p>Calculating expenses...</p>
          </div>
        ) : (
          <table className="table table-bordered table-striped expense__table">
            <thead>
              <tr>
                {globalHeaders.map((header) => (
                  <th key={header.accessor}>{header.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayedExpenses.map((expense, idx) => (
                <tr key={idx} className="expense__row">
                  {globalHeaders.map((header) => (
                    <td
                      key={header.accessor}
                      style={{
                        textAlign: `${
                          header.type === "currency" ? "right" : "left"
                        }`,
                      }}
                      className="expense__cell"
                    >
                      <span className="expense-table-text">
                        {header.type === "date"
                          ? `${moment(expense.start_date).format(
                              "LL"
                            )} - ${moment(expense.end_date).format("LL")}`
                          : header.type === "currency"
                          ? formatCurrency(
                              expense[
                                header.accessor as keyof ExpenseResponseData
                              ] as number
                            )
                          : expense[
                              header.accessor as keyof ExpenseResponseData
                            ] ?? ""}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td colSpan={2} className="table__data__value">
                  <span
                    style={{
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: 1.5,
                      fontSize: 14,
                      color: "#1a1a1a",
                    }}
                  >
                    Total Amount Spent:
                  </span>
                </td>
                <td className="table__data__value">
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: 14,
                      color: "#1a1a1a",
                      letterSpacing: 0.5,
                    }}
                  >
                    {formatCurrency(
                      displayedExpenses.reduce(
                        (acc, curr) => acc + curr.total_amount_spent,
                        0
                      )
                    )}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    );
  }
);

export const TitleContent: React.FC<
  TitleContentProps & {
    isPreview?: boolean;
    blockId?: string;
  }
> = ({ title, isPreview = true, blockId }) => {
  const { state } = useTemplateBoard();

  // Get content from global state if blockId is provided
  const globalContent = blockId
    ? state.contents.find((content) => content.block_id === Number(blockId))
        ?.content?.paper_title
    : null;
  const displayTitle = globalContent?.title || title;

  return (
    <div className="title__container mb-4">
      <small
        style={{
          display: "block",
          textTransform: "uppercase",
          letterSpacing: 1.5,
          fontSize: 11,
          fontWeight: 600,
          color: "green",
        }}
      >
        Purpose
      </small>
      <h5>{displayTitle}</h5>
    </div>
  );
};

const ContentBlockView = ({
  content,
  blockId,
}: {
  content?: OptionsContentAreaProps;
  blockId?: string;
}) => {
  const { state } = useTemplateBoard();

  // Get content directly from global state if blockId is provided
  const globalBlock = blockId
    ? state.contents.find((content) => content.block_id === Number(blockId))
    : null;
  const globalContent = globalBlock?.content as OptionsContentAreaProps;

  // Use global content if available, otherwise fall back to props
  const displayContent = globalContent || content;

  const objectKeys = useMemo(
    () => Object.keys(displayContent) as (keyof OptionsContentAreaProps)[],
    [displayContent]
  );

  const [approvals, setApprovals] = useState<SignaturePadGroupProps[]>([]);

  // Update approvals when configState changes
  useEffect(() => {
    if (state.configState) {
      const generatedApprovals = generateApprovalsFromConfig(state.configState);

      // Only update if there are generated approvals and they're different from current
      if (generatedApprovals.length > 0) {
        setApprovals(generatedApprovals);
      }
    }
  }, [state.configState]);

  const renderCard = (param: keyof OptionsContentAreaProps) => {
    switch (param) {
      case "paragraph":
        return (
          <ParagraphContent
            title={displayContent.title}
            tagline={displayContent.tagline}
            body={displayContent.paragraph?.body || ""}
            blockId={blockId}
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
            blockId={blockId}
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
            blockId={blockId}
          />
        );
      case "approval":
        return (
          <SignatureContent
            approvals={approvals || []}
            style={displayContent.approval?.style || "basic"}
            max_signatures={displayContent.approval?.max_signatures || 6}
            originator_id={displayContent.approval?.originator_id || 0}
            originator_name={displayContent.approval?.originator_name || ""}
            originator_department_id={
              displayContent.approval?.originator_department_id || 0
            }
            blockId={blockId}
          />
        );
      case "milestone":
        return (
          <MilestoneContent
            project={displayContent.milestone?.project}
            milestones={displayContent.milestone?.milestones || []}
            blockId={blockId}
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
            blockId={blockId}
          />
        );
      case "expense": {
        // Default headers for expense table
        const defaultHeaders = [
          {
            accessor: "description",
            label: "Description",
            type: "text" as const,
          },
          {
            accessor: "start_date",
            label: "Date Range",
            type: "date" as const,
          },
          {
            accessor: "total_amount_spent",
            label: "Amount",
            type: "currency" as const,
          },
        ];

        const sharedClaimState = (state.resource as any)?.claimState;
        const expenses =
          sharedClaimState?.expenses || displayContent.expense?.expenses || [];

        // Check if any expenses have been manually edited
        const hasManualEdits = sharedClaimState?.manualEditFunctions
          ? true
          : false;

        return (
          <ExpenseContent
            key={`expense-${sharedClaimState?.route}-${expenses.length}-${hasManualEdits}`}
            loaded_type={displayContent.expense?.loaded_type || "claim"}
            expenses={expenses}
            claimState={
              sharedClaimState || displayContent.expense?.claimState || null
            }
            headers={displayContent.expense?.headers || defaultHeaders}
            blockId={blockId}
          />
        );
      }

      case "paper_title":
        return (
          <TitleContent
            title={displayContent.paper_title?.title || ""}
            blockId={blockId}
          />
        );
      default:
        return <div>Unsupported content type</div>;
    }
  };

  return (
    <div className="template__view__page">
      {displayContent &&
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
