import SignatureSlot from "./SignatureSlot";
import { ApprovalCardProps } from "app/Hooks/useSignatures";
import { SignatureResponseData } from "app/Repositories/Signature/data";
import { ProgressTrackerResponseData } from "app/Repositories/ProgressTracker/data";
import { SignatoryResponseData } from "app/Repositories/Signatory/data";
import { DocumentActionResponseData } from "app/Repositories/DocumentAction/data";

const ApprovalCard = ({
  canSign,
  approvals,
  action,
  signatures,
  tracker,
  resolveAction,
  isDisabled = false,
  signIf = false,
  showName = false,
}: {
  canSign: boolean;
  isDisabled: boolean;
  signIf: boolean;
  showName?: boolean;
  approvals: ApprovalCardProps[];
  action: DocumentActionResponseData | null;
  resolveAction: (
    action: DocumentActionResponseData,
    signatory?: SignatoryResponseData
  ) => void;
  signatures?: (SignatureResponseData | null | undefined)[];
  tracker?: ProgressTrackerResponseData | null;
}) => {
  return (
    <div className="signature__section mt-5">
      <div className="row">
        {approvals?.map(({ signatory: sig, title }, index) => {
          const signature = signatures?.find(
            (si) => si?.signatory_id === sig.id
          );

          // Determine if this particular signatory can sign
          const isSlotSignatory = tracker?.signatory_id === sig.id;
          const thisCanSign = !signature && isSlotSignatory && canSign;
          return (
            <SignatureSlot
              key={sig.id}
              tracker={tracker as ProgressTrackerResponseData}
              signatory={sig as SignatoryResponseData}
              label={title}
              signature={signature as SignatureResponseData}
              canSign={signIf && thisCanSign}
              action={action}
              resolveAction={resolveAction}
              isDisabled={isDisabled}
              showName={showName}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ApprovalCard;
