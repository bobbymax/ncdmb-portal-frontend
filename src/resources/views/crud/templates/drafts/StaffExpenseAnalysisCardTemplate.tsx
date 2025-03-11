import React, { useMemo } from "react";
import { ClaimResponseData } from "app/Repositories/Claim/data";
import {
  covertToWords,
  formatAmountNoCurrency,
  formatDateToPeriodString,
} from "app/Support/Helpers";
import { useModal } from "app/Context/ModalContext";
import Button from "resources/views/components/forms/Button";
import { useAuth } from "app/Context/AuthContext";
import SignatureCanvas from "resources/views/components/capsules/SignatureCanvas";
import LetterHeadedPaper from "resources/views/components/documents/LetterHeadedPaper";
import claimLogo from "../../../../assets/images/modules/claim.png";
import { useStateContext } from "app/Context/ContentContext";
import { DraftPageProps } from "../../tabs/FilePagesTab";
import AppendSignature from "../../modals/AppendSignature";
import ClaimRepository from "app/Repositories/Claim/ClaimRepository";

const StaffExpenseAnalysisCardTemplate: React.FC<
  DraftPageProps<ClaimResponseData, ClaimRepository>
> = ({
  resource,
  currentDraft,
  draftId,
  group,
  stage,
  drafts,
  fileState,
  updateServerDataState,
}) => {
  const claim = useMemo(() => resource as ClaimResponseData, [resource]);
  const thisDraft = useMemo(() => {
    if (!drafts || draftId < 1) return null;

    return drafts.find((draft) => draft.id === draftId);
  }, [drafts, draftId]);

  const { staff } = useAuth();
  const { groups } = useStateContext();
  const { openModal, closeModal } = useModal();

  const staffGroups = useMemo(
    () => groups.map((group) => group.label),
    [groups]
  );

  const handleSignatureSubmission = (
    response: object | string,
    mode: "store" | "update" | "destroy" | "generate",
    column?: string
  ) => {
    const signatureObject = {
      authorising_staff_id: staff?.id ?? 0,
      [column as string]: response as string,
    };

    updateServerDataState(
      signatureObject,
      staff?.id ?? 0,
      response as string,
      mode
    );
    closeModal();
  };

  return (
    <LetterHeadedPaper
      tagline="Finance & Account Directorate Analysis of Expenditure"
      code={claim.code ?? ""}
      logoPath={claimLogo}
    >
      <div className="canvas__container">
        <div className="rest__layer">
          <div className="title__section">
            <p className="subtxt">Purpose of Claim:</p>
            <h1>{claim.title}</h1>
          </div>
          <div className="print__expense__wrapper mt-4">
            <div className="table__wrapper">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Duration</th>
                    <th
                      style={{
                        textAlign: "right",
                      }}
                    >
                      Amount Spent
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {claim.expenses.map((expense) => (
                    <tr key={expense.id}>
                      <td>{expense.description}</td>
                      <td>
                        {formatDateToPeriodString(
                          expense.start_date,
                          expense.end_date
                        )}
                      </td>
                      <td className="amount">
                        {formatAmountNoCurrency(expense.total_amount_spent)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="total__expense_section">
            <div className="total__expense__container">
              <p className="subtxt">Total Amount Spent:</p>
              <h1>{formatAmountNoCurrency(claim.total_amount_spent)}</h1>
            </div>
            <div className="total__expense__container">
              <p className="subtxt">Amount in Words:</p>
              <h4>{covertToWords(claim.total_amount_spent)}</h4>
            </div>
            <div className="signatures__section mt-5">
              <div className="claimant__signature__container">
                <div className="claimant__staff__details">
                  <h5 className="subtxt">{claim.owner?.staff_no}</h5>
                  <h3>{claim.owner?.grade_level}</h3>
                  <h1>{claim.owner?.name}</h1>
                </div>
                <div className="signature__pad__claimant">
                  {fileState.signature || claim?.claimant_signature ? (
                    <SignatureCanvas
                      signatureUrl={
                        (claim?.claimant_signature as string) ??
                        (fileState.signature as string)
                      }
                    />
                  ) : (
                    <div className="append__signature__bttn">
                      {staff?.id === claim.user_id && (
                        <Button
                          label="Append Signature"
                          handleClick={() =>
                            openModal(
                              AppendSignature,
                              "signature",
                              {
                                title: "Sign Claim",
                                isUpdating: true,
                                onSubmit: handleSignatureSubmission,
                                dependencies: [["claimant_signature"]],
                              },
                              claim
                            )
                          }
                          size="sm"
                          icon="ri-sketching"
                          variant="dark"
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="approval__signature__container">
                <div className="signature__pad__approval mb-5">
                  <div className="long__dash">
                    {(claim?.approval_signature || fileState.signature) &&
                    thisDraft &&
                    (thisDraft?.order ?? 0) >= 3 ? (
                      <SignatureCanvas
                        signatureUrl={
                          (claim?.approval_signature as string) ??
                          (fileState.signature as string)
                        }
                      />
                    ) : (
                      <div
                        className="append__signature__bttn"
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                        }}
                      >
                        {stage?.append_signature === 1 &&
                          staff?.carder.label === "management" &&
                          staffGroups.includes(group?.label ?? "") &&
                          staff?.id !== claim.user_id &&
                          currentDraft &&
                          currentDraft.id === draftId && (
                            <Button
                              label="Authorize Claim"
                              handleClick={() =>
                                openModal(
                                  AppendSignature,
                                  "signature",
                                  {
                                    title: "Approve Claim",
                                    isUpdating: true,
                                    onSubmit: handleSignatureSubmission,
                                    dependencies: [["approval_signature"]],
                                  },
                                  claim
                                )
                              }
                              size="sm"
                              icon="ri-sketching"
                              variant="success"
                            />
                          )}
                      </div>
                    )}
                  </div>
                  <h4>Approved</h4>
                </div>
                <div className="approving__staff__details">
                  <div className="long__dash">
                    {(claim?.approval_signature as string) &&
                      currentDraft &&
                      (currentDraft?.order ?? 0) >= 3 && (
                        <h1>{claim?.authorising_officer?.name}</h1>
                      )}
                  </div>
                  <h4>Name in Blocks:</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LetterHeadedPaper>
  );
};

export default StaffExpenseAnalysisCardTemplate;
