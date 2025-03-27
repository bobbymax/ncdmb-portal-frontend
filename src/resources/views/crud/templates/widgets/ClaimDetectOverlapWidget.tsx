import React, { useEffect, useMemo, useState } from "react";
import { SidebarProps } from "../sidebars/AnalysisSidebar";
import { ClaimResponseData } from "app/Repositories/Claim/data";
import { repo } from "bootstrap/repositories";
import { DocumentOwnerData } from "app/Repositories/Document/data";
import useDetections, { FraudReportProps } from "app/Hooks/useDetections";
import ClaimGaugeChart from "resources/views/components/charts/ClaimGaugeChart";
import moment from "moment";

const ClaimDetectOverlapWidget: React.FC<SidebarProps<ClaimResponseData>> = ({
  tracker,
  resource,
  widget,
  uploadCount,
  docType,
  document,
}) => {
  const { isFruadulentClaim } = useDetections();
  const [userClaims, setUserClaims] = useState<ClaimResponseData[]>([]);
  const [activity, setActivity] = useState<FraudReportProps | null>(null);
  const claim = useMemo(() => resource as ClaimResponseData, [resource]);
  const userRepo = useMemo(() => repo("user"), []);
  const owner: DocumentOwnerData = useMemo(() => {
    if (!document) return {} as DocumentOwnerData;
    return document.owner ?? ({} as DocumentOwnerData);
  }, [document]);

  useEffect(() => {
    if (userRepo && owner && document) {
      const claims = async () => {
        const response = await userRepo.show(
          `staff/claims/${owner.id}`,
          document.documentable_id
        );
        setUserClaims((response.data as ClaimResponseData[]) ?? []);
      };

      claims();
    }
  }, [userRepo, owner, document]);

  useEffect(() => {
    if (userClaims.length > 0 && claim) {
      setActivity(isFruadulentClaim(claim, userClaims));
    }
  }, [userClaims, claim]);

  return (
    <div className="widget claim">
      <div className="widget__title flex align gap-md">
        <i
          className={`${
            activity?.variant === "danger" ? "text-danger" : ""
          } ri-shield-flash-line`}
        />
        <h5
          className={`${activity?.variant === "danger" ? "text-danger" : ""}`}
          style={{
            margin: 0,
          }}
        >
          {widget.title}
        </h5>
      </div>

      <div className="widget__body">
        <div className="chart__display mb-3">
          <ClaimGaugeChart
            score={activity?.score ?? 0}
            reason={activity?.status}
          />
        </div>
        <div className="reason mb-3">
          <p
            style={{
              fontSize: 13,
              textAlign: "center",
              textTransform: "uppercase",
              fontWeight: 600,
              letterSpacing: 1,
              color: "#d63031",
            }}
          >
            {activity?.reason}
          </p>
        </div>
        <div className="claims">
          {activity?.conflicts &&
            activity?.conflicts.map((cla, i) => (
              <div key={i} className="conflict_claim_item file__card">
                <h5>{cla.title}</h5>
                <p>{`${moment(cla.start_date).format("ll")} - ${moment(
                  cla.end_date
                ).format("ll")}`}</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ClaimDetectOverlapWidget;
