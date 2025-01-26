import React, { useEffect, useState } from "react";
import ClaimRepository from "app/Repositories/Claim/ClaimRepository";
import { ClaimResponseData } from "app/Repositories/Claim/data";
import { DocumentControlStateProps } from "resources/views/pages/ViewResourcePage";
import Button from "resources/views/components/forms/Button";
import ClaimExpenseAnalysisDocument from "resources/templates/web/ClaimExpenseAnalysisDocument";
import { useModal } from "app/Context/ModalContext";
import AppendSignature from "../modals/AppendSignature";
import { ActionType, useForm } from "app/Hooks/useForm";
import { ServerResponse } from "app/Services/RepositoryService";
import { toast } from "react-toastify";
import Alert from "app/Support/Alert";

export type SignatureProp = {
  src: string;
  x: number;
  y: number;
};

const ClaimAppendSignature: React.FC<
  DocumentControlStateProps<ClaimResponseData, ClaimRepository>
> = ({ data, tab, Repo, loading, view }) => {
  const { openModal, closeModal } = useModal();
  const [signature, setSignature] = useState<string>("");
  const [editable, setEditable] = useState<boolean>(true);

  const onFormSubmit = (response: ServerResponse, action: ActionType) => {
    toast.success(response.message);
  };

  const { setState } = useForm(Repo, view, { onFormSubmit });

  const onSubmit = (
    response: object | string,
    mode: "store" | "update" | "destroy" | "generate"
  ) => {
    setSignature(response as string);
    setState((prev) => ({
      ...prev,
      claimant_signature: response,
    }));
    closeModal();
  };

  const registerClaim = () => {
    const formData = new FormData();

    Alert.flash(
      "Are you Sure?",
      "warning",
      "You will not be able to reverse this!!"
    ).then(async (result) => {
      if (result.isConfirmed) {
        formData.append("claimant_signature", signature);
        formData.append("status", tab.status);

        try {
          const response = await Repo.update(tab.endpoint, data.id, formData);
          if (response) {
            const claim = response.data as ClaimResponseData;
            toast.success(response.message);
            Repo.fromJson(claim);
            setEditable(false);
          }
        } catch (error) {
          toast.error("Something has gone wrong");
          console.log(error);
        }
      }
    });
  };

  useEffect(() => {
    if (data.claimant_signature) {
      setSignature(data.claimant_signature);
    }

    if (data.status && data.status !== "pending") {
      setEditable(false);
    }
  }, [data.claimant_signature, data.status]);

  return (
    <div className="row">
      <div className="col-md-12">
        <div
          className="action__area mb-4 mt-4"
          style={{
            display: "flex",
            alignItems: "flex-end",
            width: "100%",
            justifyContent: "flex-end",
            gap: 15,
          }}
        >
          <Button
            label="Append Signature"
            handleClick={() =>
              openModal(
                AppendSignature,
                "signature",
                { title: "Append Signature", isUpdating: false, onSubmit },
                Repo.getState()
              )
            }
            size="xs"
            variant="dark"
            icon="ri-sketching"
            isDisabled={signature !== "" || !editable || loading}
          />
          <Button
            label="Remove Signature"
            handleClick={() => setSignature("")}
            size="xs"
            variant="danger"
            icon="ri-close-large-line"
            isDisabled={signature === "" || !editable || loading}
          />

          <Button
            label="Register Claim"
            handleClick={() => registerClaim()}
            size="xs"
            variant="success"
            icon="ri-mail-send-line"
            isDisabled={signature === "" || !editable || loading}
          />
        </div>
      </div>
      <div className="col-md-12">
        <ClaimExpenseAnalysisDocument data={data} signature={signature} />
      </div>
    </div>
  );
};

export default ClaimAppendSignature;
