import React, { useMemo } from "react";
import { DraftPageProps } from "../../tabs/FilePagesTab";
import { PaymentBatchResponseData } from "app/Repositories/PaymentBatch/data";
import PaymentBatchRepository from "app/Repositories/PaymentBatch/PaymentBatchRepository";
import { SignatureResponseData } from "app/Repositories/Signature/data";
import LetterHeadedPaper from "resources/views/components/documents/LetterHeadedPaper";
import paymentBatch from "../../../../assets/images/modules/paymentBatch.png";
import { formatCurrency } from "app/Support/Helpers";
import useSignatures from "app/Hooks/useSignatures";
import { SignatoryResponseData } from "app/Repositories/Signatory/data";
import { ProgressTrackerResponseData } from "app/Repositories/ProgressTracker/data";
import SignatureCanvas from "resources/views/components/capsules/SignatureCanvas";
import Button from "resources/views/components/forms/Button";
import { DocumentActionResponseData } from "app/Repositories/DocumentAction/data";
import moment from "moment";
import SignatureSlot from "resources/views/components/partials/SignatureSlot";

const BatchDetail = ({ title, value }: { title: string; value: string }) => (
  <div className="row mb-2">
    <div className="col-md-5 leftt__side">{title}</div>
    <div className="col-md-7 right__side">{value}</div>
  </div>
);

const WhiteFormTemplate: React.FC<
  DraftPageProps<PaymentBatchResponseData, PaymentBatchRepository>
> = ({
  resource,
  currentDraft,
  draftId,
  group,
  stage,
  tracker,
  drafts,
  fileState,
  signatories,
  actions,
  resolveAction,
  activeSignatory,
  signatures,
}) => {
  const { canSign } = useSignatures(
    signatories as SignatoryResponseData[],
    tracker as ProgressTrackerResponseData,
    currentDraft
  );

  const batch = useMemo(() => resource as PaymentBatchResponseData, [resource]);

  const appendSignatureAction = useMemo(() => {
    return (
      actions?.find(
        (action) =>
          action.category === "signature" && action.action_status === "passed"
      ) ?? null
    );
  }, [actions]);

  const approvals = signatories?.map((signatory, index) => ({
    signatory,
    label:
      ["Head of Originating DIV/DEPT:", "DFPM:", "Executive Secretary:"][
        index
      ] ?? `Approval ${index + 1}`,
  }));

  const batchDetails = [
    {
      title: "Originating Dept/Div",
      value: batch?.department ?? batch?.directorate,
    },
    { title: "Directorate", value: batch?.directorate ?? "" },
    { title: "Budget Period", value: batch?.budget_year ?? "" },
    { title: "No. of Payments", value: batch?.expenditures?.length ?? 0 },
  ];

  const totalAmount =
    batch?.expenditures?.reduce((sum, exp) => sum + Number(exp.amount), 0) ?? 0;

  return (
    <LetterHeadedPaper
      tagline={`NCDF ${batch.type} Payment Approval Form`}
      code={batch?.code ?? ""}
      logoPath={paymentBatch}
    >
      <div className="canvas__container">
        <div className="rest__layer">
          <div className="batches mb-3" style={{ width: "100%" }}>
            {batchDetails.map((detail, index) => (
              <BatchDetail
                key={index}
                title={detail.title}
                value={String(detail.value)}
              />
            ))}
          </div>

          <div className="expenditures__table" style={{ width: "100%" }}>
            <table className="custom-table table-striped batch-table">
              <thead>
                <tr>
                  <th>S/N</th>
                  <th>Beneficiary</th>
                  <th>Amount</th>
                  <th>Budget Head</th>
                  <th>Purpose</th>
                  <th>PV Number</th>
                </tr>
              </thead>
              <tbody>
                {batch?.expenditures?.map((exp, index) => (
                  <tr key={exp.id}>
                    <td>{exp?.expenditureable?.owner?.staff_no}</td>
                    <td>{exp?.expenditureable?.owner?.name}</td>
                    <td>{formatCurrency(Number(exp.amount))}</td>
                    <td>{exp?.fund?.budget_code}</td>
                    <td>{exp.purpose}</td>
                    <td></td>
                  </tr>
                ))}
                <tr className="total">
                  <td colSpan={4} style={{ textAlign: "right" }}>
                    Total Amount:
                  </td>
                  <td colSpan={2} style={{ textAlign: "right" }}>
                    {formatCurrency(totalAmount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="approval__section mt-4" style={{ width: "100%" }}>
            <div className="approval__section__header mb-5">
              <h3 className="mb-4">Approvals</h3>
            </div>

            <div className="signature__section__area">
              <div className="row">
                {approvals?.map(({ signatory, label }, index) => {
                  const signature = signatures?.find(
                    (sig) => sig?.signatory_id === signatory.id
                  );

                  // Determine if this particular signatory can sign
                  const isSlotSignatory =
                    tracker?.signatory_id === signatory.id;
                  const thisCanSign = !signature && isSlotSignatory && canSign;
                  return (
                    <SignatureSlot
                      key={signatory.id}
                      tracker={tracker as ProgressTrackerResponseData}
                      signatory={signatory}
                      label={label}
                      signature={signature as SignatureResponseData}
                      canSign={thisCanSign}
                      action={appendSignatureAction}
                      resolveAction={resolveAction}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </LetterHeadedPaper>
  );
};

export default WhiteFormTemplate;
