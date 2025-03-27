import React from "react";
import AnimatedButton from "../forms/AnimatedButton";
import { ClaimResponseData } from "app/Repositories/Claim/data";
import moment from "moment";
import { formatCurrency, formatUrl } from "app/Support/Helpers";
import { ButtonsProp } from "../tables/CustomDataTable";

export type ClaimActionTypes = "manage" | "track" | "print";

interface ClaimCardProps<T = Partial<ClaimResponseData>> {
  claim: T;
  grid?: number;
  mb?: number;
  onManage: (data: T, action: string, url?: string) => void;
  actions: ButtonsProp[];
}

const ClaimCard = ({
  claim,
  onManage,
  actions,
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
    document_id,
    category_label,
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

  const generateUrl = (path: string, params?: (string | number)[]) => {
    if (path === "") {
      return "";
    }
    const [key, value] = params || [];
    return formatUrl(path, key, value);
  };

  return (
    <div className="custom-card file__card claim__details">
      <div className="claim__header mb-2">
        <div className="claim__header__strip flex align between mb-2">
          <p className="code">{code}</p>
          <p className="claim-badge">{status}</p>
        </div>
        <h2>{title}</h2>
      </div>
      <div className="claims-card-body mt-3">
        <div className="row">
          <div className="col-md-12 mb-2">
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                flexWrap: "wrap",
                lineHeight: 1.2,
              }}
              className="amount__due"
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
            {actions.map((bttn, i) => (
              <AnimatedButton
                key={i}
                label={bttn.display ?? ""}
                handleClick={() =>
                  onManage(
                    claim,
                    bttn.label,
                    generateUrl(bttn.url ?? "", [category_label as string, id])
                  )
                }
                size="xs"
                flag="fast"
                animation="fadeInLeft"
                variant={bttn.variant}
                speedup
                icon={bttn.icon}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClaimCard;
