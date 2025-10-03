import { DocumentActionResponseData } from "app/Repositories/DocumentAction/data";
import { ProgressTrackerResponseData } from "app/Repositories/ProgressTracker/data";
import { SignatoryResponseData } from "app/Repositories/Signatory/data";
import { SignatureResponseData } from "app/Repositories/Signature/data";
import React from "react";
import SignatureCanvas from "../capsules/SignatureCanvas";
import Button from "../forms/Button";
import moment from "moment";

const SignatureSlot = ({
  tracker,
  signatory,
  signature,
  label,
  canSign,
  action,
  resolveAction,
  isDisabled = false,
  grid = 12,
  template = "batch",
  showName = false,
}: {
  tracker: ProgressTrackerResponseData;
  signatory: SignatoryResponseData;
  signature?: SignatureResponseData;
  label: string;
  canSign: boolean;
  action: any;
  resolveAction: (
    action: DocumentActionResponseData,
    signatory?: SignatoryResponseData
  ) => void;
  showName?: boolean;
  isDisabled?: boolean;
  grid?: number;
  template?: "batch" | "voucher" | "requisition";
}) => {
  return (
    <div className={`col-md-${grid} mb-4`}>
      <div className="row">
        <div className="col-md-8 mb-3">
          <div className="singing__items flex align gap-md">
            <h5>{label}</h5>
            <div className="signing__contain" style={{ flex: 1 }}>
              {signature ? (
                <div className="signing__pad">
                  <SignatureCanvas
                    styles={{
                      width: "90%",
                      justifyContent: "flex-end",
                    }}
                    signatureUrl={signature.signature}
                    signature={showName ? signature : null}
                    category={null}
                    tracker={null}
                  />
                </div>
              ) : (
                canSign &&
                action && (
                  <Button
                    label={action.button_text}
                    size="xs"
                    variant={action.variant}
                    handleClick={() => resolveAction(action, signatory)}
                    isDisabled={isDisabled}
                  />
                )
              )}
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="singing__items flex align gap-md">
            <h5>Date:</h5>
            <div className="signing__contain" style={{ flex: 1 }}>
              {signature ? (
                <small
                  className="handwritten date__slot"
                  style={{
                    fontSize: "3rem",
                    color: "darkblue",
                  }}
                >
                  {moment(signature?.created_at).format("L")}
                </small>
              ) : (
                <small></small>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignatureSlot;
