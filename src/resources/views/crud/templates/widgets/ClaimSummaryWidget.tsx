import React, { useMemo } from "react";
import { SidebarProps } from "../sidebars/AnalysisSidebar";
import { ClaimResponseData } from "app/Repositories/Claim/data";
import { DocumentOwnerData } from "app/Repositories/Document/data";
import moment from "moment";
import { formatAmountNoCurrency } from "app/Support/Helpers";

const ClaimSummaryWidget: React.FC<SidebarProps<ClaimResponseData>> = ({
  tracker,
  resource,
  widget,
  uploadCount,
  docType,
  document,
}) => {
  const owner: DocumentOwnerData = useMemo(() => {
    if (!document) return {} as DocumentOwnerData;
    return document.owner ?? ({} as DocumentOwnerData);
  }, [document]);

  const claim: ClaimResponseData = useMemo(() => {
    if (!resource) return {} as ClaimResponseData;
    return (resource as ClaimResponseData) ?? ({} as ClaimResponseData);
  }, [resource]);

  return (
    <div className="widget claim">
      <div className="widget__title flex align gap-md">
        <i className="ri-wallet-3-line" />
        <h5>{widget.title}</h5>
      </div>

      <div className="widget__body">
        <p>
          This claim was submitted by {owner.name} on{" "}
          {moment(claim?.created_at).format("LL")}, titled &quot;{claim.title}
          &quot;. It was initiated under the sponsorship of the{" "}
          {claim?.department_name} department and comprises{" "}
          {claim?.expenses.length} expense item
          {claim?.expenses.length === 1 ? "" : "s"}. The total amount claimed
          is:
        </p>

        <p className="amount">
          <span>NGN</span> {formatAmountNoCurrency(claim?.total_amount_spent)}
        </p>
      </div>
    </div>
  );
};

export default ClaimSummaryWidget;
