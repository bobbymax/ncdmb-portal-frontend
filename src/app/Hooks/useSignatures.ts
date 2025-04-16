import { useAuth } from "app/Context/AuthContext";
import { DocumentDraftResponseData } from "app/Repositories/DocumentDraft/data";
import { ProgressTrackerResponseData } from "app/Repositories/ProgressTracker/data";
import { SignatoryResponseData } from "app/Repositories/Signatory/data";
import { useMemo } from "react";

const useSignatures = (
  signatories: SignatoryResponseData[],
  tracker: ProgressTrackerResponseData,
  currentDraft: DocumentDraftResponseData
) => {
  const { staff } = useAuth();

  const stageSingatory = useMemo(() => {
    if (!tracker) return null;
    return signatories.find((s) => s.id === tracker.signatory_id);
  }, [tracker, signatories]);

  // console.log(stageSingatory);

  const canSignDocument = useMemo(() => {
    // Early exit if any required entity is missing
    if (!staff || !tracker || !currentDraft || !signatories?.length)
      return false;
    if (tracker.signatory_id === 0) return false;

    const signatory = signatories.find((s) => s.id === tracker.signatory_id);

    if (!signatory) return false;

    const expectedDepartmentId =
      tracker.department_id !== 0
        ? tracker.department_id
        : currentDraft.department_id;

    const isInGroup = staff.groups?.some(
      (group) => group.id === signatory.group_id
    );

    console.log(isInGroup);

    const isInDepartment = staff.department_id === expectedDepartmentId;
    const belongsToCarder = staff.carder?.id === tracker.carder_id;

    return isInGroup && isInDepartment && belongsToCarder;
  }, [signatories, tracker, staff, currentDraft]);

  return { canSignDocument, stageSingatory };
};

export default useSignatures;
