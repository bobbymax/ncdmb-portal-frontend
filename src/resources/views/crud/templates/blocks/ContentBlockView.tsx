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

export const ParagraphContent: React.FC<
  ParagraphContentAreaProps & {
    title?: string;
    tagline?: string;
    isPreview?: boolean;
  }
> = ({ title, tagline, body, isPreview = true }) => {
  return isPreview ? (
    <div className="paragraph__container mb-4">
      <h4 className="mb-2">{title}</h4>
      <small>{tagline}</small>
      <p dangerouslySetInnerHTML={{ __html: body }} />
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
}) => {
  return (
    <div className="dynamic__table mb-4">
      <DynamicTableBuilder headers={headers} rows={rows} />
    </div>
  );
};

export const MilestoneContent: React.FC<
  MilestoneContentAreaProps & { isPreview?: boolean }
> = ({ project, milestones, isPreview = true }) => {
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
          {milestones.map((milestone, idx) => (
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
  SignatureContentAreaProps & { isPreview?: boolean }
> = ({
  approvals,
  style,
  max_signatures,
  originator_id,
  originator_name,
  originator_department_id,
  isPreview = true,
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

export const EventContent: React.FC<
  EventContentAreaProps & { isPreview?: boolean }
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

export const InvoiceContent: React.FC<
  InvoiceContentAreaProps & { isPreview?: boolean }
> = ({
  invoice,
  isPreview = true,
  markup,
  currency,
  vat,
  service_charge,
  total,
  sub_total,
}) => {
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
          {invoice?.items.map((item, idx) => (
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
            <td className="table__data__value">{formatCurrency(sub_total)}</td>
          </tr>
          {markup > 0 && (
            <tr>
              <td colSpan={3} className="table__data__value">
                Service Charge ({markup}%):
              </td>
              <td className="table__data__value">
                {formatCurrency(service_charge)}
              </td>
            </tr>
          )}
          <tr>
            <td colSpan={3} className="table__data__value">
              VAT (7.5%):
            </td>
            <td className="table__data__value">{formatCurrency(vat)}</td>
          </tr>
          <tr>
            <td colSpan={3} className="table__data__value">
              Total:
            </td>
            <td className="table__data__value">{formatCurrency(total)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export const ExpenseContent: React.FC<
  ExpenseContentProps & { isPreview?: boolean }
> = React.memo(
  ({ loaded_type, isPreview = true, expenses, claimState, headers }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [displayedExpenses, setDisplayedExpenses] = useState(expenses);

    // Handle loading state when expenses change
    useEffect(() => {
      if (JSON.stringify(expenses) !== JSON.stringify(displayedExpenses)) {
        setIsLoading(true);

        // Simulate loading time
        const timer = setTimeout(() => {
          setDisplayedExpenses(expenses);
          setIsLoading(false);
        }, 800);

        return () => clearTimeout(timer);
      }
    }, [expenses, displayedExpenses]);

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
                {headers.map((header) => (
                  <th key={header.accessor}>{header.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayedExpenses.map((expense, idx) => (
                <tr key={idx} className="expense__row">
                  {headers.map((header) => (
                    <td key={header.accessor} className="expense__cell">
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
            </tbody>
          </table>
        )}
      </div>
    );
  }
);

export const TitleContent: React.FC<
  TitleContentProps & { isPreview?: boolean }
> = ({ title, isPreview = true }) => {
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
      <h5>{title}</h5>
    </div>
  );
};

const ContentBlockView = ({
  content,
  configState,
  generatedData,
}: {
  content: OptionsContentAreaProps;
  configState: ConfigState;
  generatedData?: unknown;
}) => {
  const objectKeys = useMemo(
    () => Object.keys(content) as (keyof OptionsContentAreaProps)[],
    [content]
  );

  const [approvals, setApprovals] = useState<SignaturePadGroupProps[]>([]);

  // Update approvals when configState changes
  useEffect(() => {
    if (configState) {
      const generatedApprovals = generateApprovalsFromConfig(configState);

      // Only update if there are generated approvals and they're different from current
      if (generatedApprovals.length > 0) {
        setApprovals(generatedApprovals);
      }
    }
  }, [configState]);

  // console.log("Content Block View", content);

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
            approvals={approvals || []}
            style={content.approval?.style || "basic"}
            max_signatures={content.approval?.max_signatures || 6}
            originator_id={content.approval?.originator_id || 0}
            originator_name={content.approval?.originator_name || ""}
            originator_department_id={
              content.approval?.originator_department_id || 0
            }
          />
        );
      case "milestone":
        return (
          <MilestoneContent
            project={content.milestone?.project}
            milestones={content.milestone?.milestones || []}
          />
        );
      case "invoice":
        return (
          <InvoiceContent
            invoice={content.invoice?.invoice || null}
            project={content.invoice?.project || null}
            items={content.invoice?.items || []}
            sub_total={content.invoice?.sub_total || 0}
            total={content.invoice?.total || 0}
            vat={content.invoice?.vat || 0}
            service_charge={content.invoice?.service_charge || 0}
            markup={content.invoice?.markup || 0}
            currency={content.invoice?.currency || "NGN"}
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

        const sharedClaimState = (generatedData as any)?.claimState;
        const expenses =
          sharedClaimState?.expenses || content.expense?.expenses || [];

        // Check if any expenses have been manually edited
        const hasManualEdits = sharedClaimState?.manualEditFunctions
          ? true
          : false;

        return (
          <ExpenseContent
            key={`expense-${sharedClaimState?.route}-${expenses.length}-${hasManualEdits}`}
            loaded_type={content.expense?.loaded_type || "claim"}
            expenses={expenses}
            claimState={sharedClaimState || content.expense?.claimState || null}
            headers={content.expense?.headers || defaultHeaders}
          />
        );
      }

      case "paper_title":
        return <TitleContent title={content.paper_title?.title || ""} />;
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
