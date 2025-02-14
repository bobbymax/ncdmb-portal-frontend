import { useStateContext } from "app/Context/ContentContext";
import { ModalValueProps, useModal } from "app/Context/ModalContext";
import { JsonResponse } from "app/Repositories/BaseRepository";
import React, { useEffect, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import Button from "resources/views/components/forms/Button";
import TextInput from "resources/views/components/forms/TextInput";

type SignatureDependencyProps = [column: string[]];

const AppendSignature: React.FC<ModalValueProps<JsonResponse>> = ({
  title,
  data,
  isUpdating,
  dependencies,
  onSubmit,
}) => {
  const { getModalState, updateModalState } = useModal();
  const { isLoading } = useStateContext();
  const identifier = "signature";
  const state: JsonResponse = getModalState(identifier);

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [clearedImage, setClearedImage] = useState<string | null>(null); // Temporarily store cleared image
  const signaturePadRef = useRef<SignatureCanvas | null>(null);
  const [column, setColumn] = useState<string>("");

  const handleClear = () => {
    if (uploadedImage) {
      setClearedImage(uploadedImage); // Save cleared image for reuse
      setUploadedImage(null); // Clear the uploaded image
    } else {
      signaturePadRef.current?.clear();
    }
  };

  // Reuse cleared image
  const handleReuse = () => {
    if (clearedImage) {
      setUploadedImage(clearedImage);
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
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    const signatureData = uploadedImage || signaturePadRef.current?.toDataURL();
    if (signatureData) {
      setUploadedImage(null);
      onSubmit(signatureData, "generate", column);
    }
  };

  useEffect(() => {
    if (dependencies) {
      const [column = []] = dependencies as SignatureDependencyProps;
      setColumn(column[0]);
    }
  }, [dependencies]);

  return (
    <>
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
            label="Append Signature"
            handleClick={handleSubmit}
            variant="success"
            isDisabled={isLoading}
            icon="ri-sketching"
            size="sm"
          />
        </div>
      </div>
    </>
  );
};

export default AppendSignature;
