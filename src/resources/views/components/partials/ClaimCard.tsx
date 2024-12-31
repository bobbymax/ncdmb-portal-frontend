import React from "react";
import AnimatedButton from "../forms/AnimatedButton";
import { ClaimResponseData } from "app/Repositories/Claim/data";
import moment from "moment";
import { formatCurrency } from "app/Support/Helpers";

export type ClaimActionTypes = "manage" | "track" | "print";

interface ClaimCardProps<T = Partial<ClaimResponseData>> {
  claim: T;
  grid?: number;
  mb?: number;
  onManage: (data: T, action: ClaimActionTypes, url?: string) => void;
}

const ClaimCard = ({
  claim,
  onManage,
  grid = 4,
  mb = 2,
}: ClaimCardProps<ClaimResponseData>) => {
  const {
    id,
    code,
    title,
    start_date,
    end_date,
    total_amount_spent,
    status,
    created_at,
    document_category_id,
    expenses = [],
  } = claim;

  const formatPeriod = (
    startDate: string,
    endDate: string
  ): { start: string; end: string; duration: number; period: string } => {
    const start = moment(startDate);
    const end = moment(endDate);
    const duration = end.diff(start, "days");

    return {
      start: start.format("ll"),
      end: end.format("ll"),
      duration,
      period: `${start.format("ll")} - ${end.format("ll")}`,
    };
  };

  return (
    <div className="custom-card claims-card">
      <div className="claims-card-header mb-2">
        <div className="flex align between gap-lg mb-2">
          <p className="code">{code}</p>
          <p className="status-badge">{status}</p>
        </div>
        <h2>{title}</h2>
      </div>
      <div className="claims-card-body">
        <div className="row">
          <div className="col-md-12 mb-2">
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                flexWrap: "wrap",
                lineHeight: 0.9,
              }}
            >
              <small className="title">Total Amount Due:</small>
              <p className="amount">{formatCurrency(total_amount_spent)}</p>
            </div>
          </div>
          <div className="col-md-12 mt-2 mb-2">
            <p className="duration">
              Duration: {formatPeriod(start_date, end_date).period}
            </p>
          </div>
        </div>
      </div>
      {/* animate__bounceInLeft */}
      <div className="claims-card-footer mt-3">
        <div className="heartbeat-container">
          {/* <div className="heartbeat"></div> */}
          <div className="manage-button">
            <AnimatedButton
              label="Manage"
              handleClick={() =>
                onManage(
                  claim,
                  "manage",
                  `/staff-services/claims/${document_category_id}/${id}/manage`
                )
              }
              size="xs"
              animation="fadeInLeft"
              flag="faster"
              speedup
              variant="danger"
              icon="ri-settings-line"
            />
            <AnimatedButton
              label="Track"
              handleClick={() => onManage(claim, "track")}
              size="xs"
              flag="fast"
              animation="fadeInLeft"
              speedup
              icon="ri-pushpin-line"
            />
            <AnimatedButton
              label="Print"
              handleClick={() => onManage(claim, "print")}
              animation="fadeInLeft"
              size="xs"
              variant="success"
              icon="ri-printer-line"
            />
          </div>
        </div>
        <small className="date_created">
          Registered on: {moment(created_at).format("ll")}
        </small>
        <small
          style={{
            display: "block",
            textAlign: "right",
            fontSize: ".75rem",
            letterSpacing: 3,
            fontWeight: 600,
            textTransform: "uppercase",
          }}
          className="expenses_desc"
        >
          {`${expenses.length} total expenses`}
        </small>
      </div>
    </div>
  );
};

export default ClaimCard;
