import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ActionComponentProps } from "../../modals/DocumentUpdateModal";
import { SignatureResponseData } from "app/Repositories/Signature/data";
import SignatureRepository from "app/Repositories/Signature/SignatureRepository";
import { useStateContext } from "app/Context/ContentContext";
import { useAuth } from "app/Context/AuthContext";
import { SignatoryResponseData } from "app/Repositories/Signatory/data";
import SignatureCanvas from "react-signature-canvas";
import Button from "resources/views/components/forms/Button";
import TextInput from "resources/views/components/forms/TextInput";

type DependenciesProps = [signatories: SignatoryResponseData[]];

const AppendSignatureActionComponent: React.FC<
  ActionComponentProps<SignatureResponseData, SignatureRepository>
> = ({
  identifier,
  getModalState,
  currentDraft,
  action,
  updateModalState,
  handleFormSubmit,
  dependencies,
}) => {
  const { isLoading } = useStateContext();
  const { staff } = useAuth();
  const state: SignatureResponseData = getModalState(identifier);

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [clearedImage, setClearedImage] = useState<string | null>(null); // Temporarily store cleared image
  const signaturePadRef = useRef<SignatureCanvas | null>(null);

  const handleClear = () => {
    if (uploadedImage) {
      setClearedImage(uploadedImage); // Save cleared image for reuse
      updateModalState(identifier, {
        ...state,
        signature: uploadedImage,
      });
      setUploadedImage(null); // Clear the uploaded image
    } else {
      signaturePadRef.current?.clear();
    }
  };

  // Reuse cleared image
  const handleReuse = () => {
    if (clearedImage) {
      setUploadedImage(clearedImage);
      updateModalState(identifier, {
        ...state,
        signature: clearedImage,
      });
      setClearedImage(null); // Clear the temporary storage
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedImage(event.target.result as string);
          setClearedImage(null); // Clear previously stored image
          updateModalState(identifier, {
            ...state,
            signature: event.target?.result as string,
          });
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let lastSignature = "";

    const pad = signaturePadRef.current;
    if (!uploadedImage && pad) {
      interval = setInterval(() => {
        if (!pad.isEmpty()) {
          const currentSig = pad.toDataURL();

          if (currentSig !== lastSignature) {
            lastSignature = currentSig;
            updateModalState(identifier, {
              ...state,
              signature: currentSig,
            });
            console.log("✏️ Signature updated.");
          }
        }
      }, 300);
    }

    return () => clearInterval(interval);
  }, [uploadedImage, signaturePadRef.current]);

  useEffect(() => {
    if (staff && currentDraft && dependencies) {
      const [signatories = []] = dependencies as DependenciesProps;
      const signatory = signatories[4];

      updateModalState(identifier, {
        ...state,
        user_id: staff.id,
        document_draft_id: currentDraft.id,
        signatory_id: signatory?.id ?? 0,
      });
    }
  }, [staff, currentDraft, dependencies]);

  return (
    <form onSubmit={handleFormSubmit}>
      <div className="signature__pad__outter">
        <div className="signature__body">
          {!uploadedImage ? (
            <div className="signature__pad__container">
              <SignatureCanvas
                ref={(ref) => (signaturePadRef.current = ref)}
                canvasProps={{
                  width: 750,
                  height: 200,
                  className: "signature-pad, custom__signature__pad",
                }}
              />
            </div>
          ) : (
            <img
              src={uploadedImage}
              alt="Uploaded Signature"
              style={{ width: "30%", margin: "0px auto" }}
              className="signature__img"
            />
          )}
        </div>
        <div className="signature__pad__upload">
          <TextInput
            type="file"
            accept="image/*"
            onChange={handleUpload}
            name="signature"
          />
        </div>

        <div
          className="signature__actions"
          style={{
            display: "flex",
            alignItems: "flex-end",
            width: "100%",
            justifyContent: "flex-end",
            gap: 15,
          }}
        >
          <Button
            label="Clear"
            handleClick={handleClear}
            variant="danger"
            isDisabled={isLoading}
            icon="ri-filter-off-line"
            size="sm"
          />
          {clearedImage && (
            <Button
              label="Reuse Last Signature"
              handleClick={handleReuse}
              variant="info"
              isDisabled={isLoading}
              icon="ri-history-line"
              size="sm"
            />
          )}
          <Button
            label={action.button_text}
            type="submit"
            variant={action.variant}
            isDisabled={isLoading}
            icon={action.icon}
            size="sm"
          />
        </div>
      </div>
    </form>
  );
};

export default AppendSignatureActionComponent;
