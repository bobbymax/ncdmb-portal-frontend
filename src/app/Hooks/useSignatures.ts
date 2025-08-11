import { useAuth } from "app/Context/AuthContext";
import { DocumentDraftResponseData } from "app/Repositories/DocumentDraft/data";
import { ProgressTrackerResponseData } from "app/Repositories/ProgressTracker/data";
import { SignatoryResponseData } from "app/Repositories/Signatory/data";
import { useCallback, useEffect, useMemo, useState } from "react";
import useCarders from "./utilities/useCarders";

export type ApprovalCardProps = {
  signatory: SignatoryResponseData;
  title: string;
};

const useSignatures = (
  signatories: SignatoryResponseData[],
  tracker: ProgressTrackerResponseData,
  currentDraft: DocumentDraftResponseData
) => {
  const { staff } = useAuth();
  const { isOperational } = useCarders(
    tracker?.carder_id,
    staff?.carder?.id ?? 0
  );

  const [canSign, setCanSign] = useState<boolean>(false);

  const stageSignatory = useMemo(() => {
    if (!tracker) return null;
    return signatories.find((s) => s.id === tracker.signatory_id);
  }, [tracker, signatories]);

  const canSignDocument = useCallback(() => {
    // Guard clauses to ensure required data is available
    if (
      !staff ||
      !tracker ||
      !currentDraft ||
      !signatories?.length ||
      !stageSignatory
    ) {
      return false;
    }

    // Determine department ID to match against
    const expectedDepartmentId =
      tracker.department_id > 0
        ? tracker.department_id
        : currentDraft.department_id;

    // Ensure the signatory is actually defined
    if (tracker.signatory_id < 1) return false;

    // Check if user belongs to the required group
    const isInRequiredGroup =
      staff.groups?.some((group) => group.id === stageSignatory.group_id) ??
      false;

    // Check department match
    const isInRequiredDepartment = staff.department_id === expectedDepartmentId;

    // Final result: must match group, department, and carder condition
    return isInRequiredGroup && isInRequiredDepartment && isOperational;
  }, [
    staff,
    tracker,
    currentDraft,
    signatories,
    stageSignatory,
    isOperational,
  ]);

  const arrangeApprovals = (
    approvals: string[],
    signatories: SignatoryResponseData[] | undefined
  ) => {
    if (!signatories) return [];

    return signatories?.map((signatory, index) => ({
      signatory,
      title: approvals[index] ?? `Approval ${index + 1}`,
    }));
  };

  useEffect(() => {
    setCanSign(canSignDocument());
  }, [canSignDocument]);

  return { canSign, stageSignatory, arrangeApprovals };
};

export default useSignatures;
