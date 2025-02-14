import React, { useEffect, useRef } from "react";

const SignatureCanvas = ({ signatureUrl }: { signatureUrl: string }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const image = new Image();
    image.src = signatureUrl;
    image.onload = () => {
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    };
  }, [signatureUrl]);

  return (
    <canvas
      ref={canvasRef}
      width={250}
      height={120}
      className="signature-container"
      style={{ pointerEvents: "none", userSelect: "none" }}
    />
  );
};

export default SignatureCanvas;
