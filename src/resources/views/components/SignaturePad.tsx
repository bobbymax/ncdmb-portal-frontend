import React, { useRef } from "react";
import SignatureCanvas from "react-signature-canvas";

interface SignaturePadProps {
  onSave: (dataUrl: string) => void;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ onSave }) => {
  const signaturePadRef = useRef<SignatureCanvas | null>(null);

  const handleSave = () => {
    if (signaturePadRef.current?.isEmpty()) {
      alert("Please provide a signature.");
      return;
    }
    const dataUrl = signaturePadRef.current?.toDataURL("image/png");
    onSave(dataUrl ?? "");
  };

  return (
    <div>
      <h3>Sign Here</h3>
      <SignatureCanvas
        ref={(ref) => (signaturePadRef.current = ref)}
        canvasProps={{ width: 500, height: 200, className: "signature-pad" }}
      />
      <button onClick={handleSave}>Append Signature</button>
    </div>
  );
};

export default SignaturePad;
