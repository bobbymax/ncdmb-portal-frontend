import React, { useEffect, useMemo, useState } from "react";
import {
  DraftCardProps,
  DraftPageProps,
  TabModelProps,
} from "../tabs/FilePagesTab";
import { ClaimResponseData } from "app/Repositories/Claim/data";
import {
  covertToWords,
  formatAmountNoCurrency,
  formatDateToPeriodString,
} from "app/Support/Helpers";
import { useModal } from "app/Context/ModalContext";
import Button from "resources/views/components/forms/Button";
import AppendSignature from "../modals/AppendSignature";
import { useAuth } from "app/Context/AuthContext";
import { GroupResponseData } from "app/Repositories/Group/data";
import ClaimRepository from "app/Repositories/Claim/ClaimRepository";
import SignatureCanvas from "resources/views/components/capsules/SignatureCanvas";
import LetterHeadedPaper from "resources/views/components/documents/LetterHeadedPaper";
import claimLogo from "../../../assets/images/modules/claim.png";

const StaffExpenseAnalysisCardTemplate: React.FC<
  DraftPageProps<TabModelProps>
> = ({ data, draftId, updateLocalState, group, stage }) => {
  const claim = useMemo(() => data as ClaimResponseData, [data]);
  const { authState } = useAuth();

  const { openModal, closeModal } = useModal();
  const [claimState, setClaimState] = useState<
    DraftCardProps & { claimant_signature: string; approval_signature: string }
  >({
    resource_id: 0,
    user_id: 0,
    draftable_id: 0,
    claimant_signature: "",
    approval_signature: "",
  });
  const [signature, setSignature] = useState<string>("");

  const onSubmit = (
    response: object | string,
    mode: "store" | "update" | "destroy" | "generate",
    column?: string
  ) => {
    setClaimState((prev) => ({
      ...prev!,
      isSigned: true,
      [column as string]: response as string,
    }));

    setSignature(response as string);
    closeModal();
  };

  // console.log(claimState, claim);

  useEffect(() => {
    if (claim && draftId > 0) {
      setClaimState((prev) => ({
        ...prev,
        resource_id: claim.id,
        user_id: claim?.user_id ?? 0,
        draftable_id: claim.id,
        claimant_signature: claim.claimant_signature ?? "",
        approval_signature: claim.approval_signature ?? "",
      }));
    }
  }, [claim, draftId]);

  useEffect(() => {
    updateLocalState({
      isSigned: signature !== "",
      draft_id: draftId,
      service: "claim",
      state: claimState,
      signature,
    });
  }, [claimState]);

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
                  {claimState?.claimant_signature ? (
                    <SignatureCanvas
                      signatureUrl={claimState?.claimant_signature}
                    />
                  ) : (
                    <div className="append__signature__bttn">
                      {authState?.staff?.id === claim.user_id && (
                        <Button
                          label="Append Signature"
                          handleClick={() =>
                            openModal(
                              AppendSignature,
                              "signature",
                              {
                                title: "Sign Claim",
                                isUpdating: true,
                                onSubmit,
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
                    {claim.approval_signature ? (
                      <img
                        src={claim.approval_signature}
                        className="signature__item"
                        alt="Signature"
                      />
                    ) : (
                      <div
                        className="append__signature__bttn"
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                        }}
                      >
                        {Array.isArray(authState?.staff?.groups) &&
                          authState.staff?.groups.some(
                            (g) => g.id === (group as GroupResponseData).id
                          ) &&
                          authState.staff?.id !== claimState.user_id && (
                            <Button
                              label="Authorize Claim"
                              handleClick={() => {}}
                              size="sm"
                              icon="ri-sketching"
                              variant="success"
                            />
                          )}

                        {/* Add if loggedin user is === claim user_id then show the request signature button */}
                      </div>
                    )}
                  </div>
                  <h4>Approved</h4>
                </div>
                <div className="approving__staff__details">
                  <div className="long__dash" />
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
