import React, { useEffect, useMemo, useState } from "react";
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
import ClaimRepository from "app/Repositories/Claim/ClaimRepository";
import { SignatoryResponseData } from "app/Repositories/Signatory/data";
import { SignatureResponseData } from "app/Repositories/Signature/data";

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
  signatories,
  actions,
  resolveAction,
  activeSignatory,
  signatures,
}) => {
  const [owner, setOwner] = useState<SignatureResponseData | null>(null);
  const [authoriser, setAuthoriser] = useState<SignatureResponseData | null>(
    null
  );
  const claim = useMemo(() => resource as ClaimResponseData, [resource]);

  const appendSignatureAction = useMemo(() => {
    if (!actions || actions.length < 1) return null;

    return actions.find(
      (action) =>
        action.category === "signature" && action.action_status === "passed"
    );
  }, [actions]);

  const { staff } = useAuth();
  const { groups } = useStateContext();

  const staffGroups = useMemo(
    () => groups.map((group) => group.label),
    [groups]
  );

  useEffect(() => {
    if (signatures && signatures?.length > 0) {
      setOwner(
        signatures.find((signature) => signature?.type === "owner") ?? null
      );
      setAuthoriser(
        signatures.find((signature) => signature?.type === "approval") ?? null
      );
    }
  }, [signatures]);

  // console.log(signatures);

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
                  {owner ? (
                    <SignatureCanvas
                      styles={{
                        width: "85%",
                      }}
                      signatureUrl={owner.signature}
                    />
                  ) : (
                    <div className="append__signature__bttn">
                      {activeSignatory?.type === "owner" &&
                        staff?.id === claim.user_id &&
                        appendSignatureAction && (
                          <Button
                            label={appendSignatureAction.button_text}
                            handleClick={() =>
                              resolveAction(
                                appendSignatureAction,
                                activeSignatory
                              )
                            }
                            size="sm"
                            icon={appendSignatureAction.icon}
                            variant={appendSignatureAction.variant}
                          />
                        )}
                    </div>
                  )}
                </div>
              </div>
              <div className="approval__signature__container">
                <div className="signature__pad__approval mb-5">
                  <div className="long__dash">
                    {authoriser ? (
                      <SignatureCanvas
                        styles={{
                          width: "160%",
                          justifyContent: "flex-end",
                        }}
                        signatureUrl={authoriser.signature}
                      />
                    ) : (
                      <div
                        className="append__signature__bttn"
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          alignItems: "flex-end",
                        }}
                      >
                        {appendSignatureAction &&
                          activeSignatory?.type === "approval" &&
                          staff?.carder.label === "management" &&
                          staffGroups.includes(group?.label ?? "") &&
                          staff?.id !== claim.user_id &&
                          currentDraft?.department_id ===
                            staff?.department_id && (
                            <Button
                              label={appendSignatureAction.button_text}
                              handleClick={() =>
                                resolveAction(
                                  appendSignatureAction,
                                  activeSignatory
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
                  <h4>Approved By:</h4>
                </div>
                <div className="approving__staff__details">
                  <div className="long__dash">
                    {authoriser && (
                      <h1>{authoriser.approving_officer?.name}</h1>
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
