import { ClaimResponseData } from "app/Repositories/Claim/data";

export type FraudReportProps = {
  status: string;
  variant: string;
  reason: string;
  score: number;
  tag: string;
  conflicts: ClaimResponseData[];
};

const useDetections = () => {
  const isFruadulentClaim = (
    newClaim: ClaimResponseData,
    existingClaims: ClaimResponseData[]
  ): FraudReportProps => {
    const newStart = new Date(newClaim.start_date).getTime();
    const newEnd = new Date(newClaim.end_date).getTime();

    let score = 0;
    let reason = "No conflict";
    const conflicts: ClaimResponseData[] = [];

    for (const claim of existingClaims) {
      //   if (claim.location_id !== newClaim.location_id) continue;

      const existingStart = new Date(claim.start_date).getTime();
      const existingEnd = new Date(claim.end_date).getTime();

      const isDuplicate = newStart === existingStart && newEnd === existingEnd;
      const isContained = newStart >= existingStart && newEnd <= existingEnd;
      const isCovering = newStart <= existingStart && newEnd >= existingEnd;
      const overlaps = newStart <= existingEnd && newEnd >= existingStart;

      if (isDuplicate) {
        score += 100;
        reason = "Exact duplicate";
        conflicts.push(claim);
        continue;
      }

      if (isContained) {
        score += 90;
        reason = "Claim falls completely within an existing claim";
        conflicts.push(claim);
        continue;
      }

      if (isCovering) {
        score += 80;
        reason = "Claim fully covers an existing claim";
        conflicts.push(claim);
        continue;
      }

      if (overlaps) {
        score += 70;
        reason = "Claim partially overlaps with existing claim";
        conflicts.push(claim);
        continue;
      }

      // Close proximity check (optional)
      const daysBeforeStart = (existingStart - newEnd) / (1000 * 3600 * 24);
      const daysAfterEnd = (newStart - existingEnd) / (1000 * 3600 * 24);
      if (daysBeforeStart > 0 && daysBeforeStart <= 2) {
        score += 40;
        reason = "Claim is very close to another claim (before)";
        conflicts.push(claim);
      }
      if (daysAfterEnd > 0 && daysAfterEnd <= 2) {
        score += 40;
        reason = "Claim is very close to another claim (after)";
        conflicts.push(claim);
      }
    }

    if (conflicts.length > 0) {
      score += (conflicts.length - 1) * 10;
    }

    // Cap score at 100
    score = Math.min(score, 100);
    let statusObj: { status: string; variant: string; tag: string };

    if (score <= 40) {
      statusObj = { status: "Safe", variant: "primary", tag: "low" };
    } else if (score > 40 && score <= 70) {
      statusObj = {
        status: "Questionable",
        variant: "secondary",
        tag: "medium",
      };
    } else if (score > 70 && score <= 90) {
      statusObj = { status: "High Risk", variant: "danger", tag: "high" };
    } else {
      statusObj = { status: "Critical", variant: "danger", tag: "critical" };
    }

    return {
      ...statusObj,
      score,
      reason,
      conflicts,
    };
  };

  return { isFruadulentClaim };
};

export default useDetections;
