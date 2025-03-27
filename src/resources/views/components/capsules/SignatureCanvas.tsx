import { useEffect, useRef } from "react";

const SignatureCanvas = ({
  signatureUrl,
  styles,
}: {
  signatureUrl: string;
  styles?: { [key: string]: string | number };
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const image = new Image();
    image.crossOrigin = "anonymous"; // Handle CORS issues for external images
    image.src = signatureUrl;

    image.onload = () => {
      // Resize canvas to match the image
      canvas.width = image.width;
      canvas.height = image.height;

      // Step 1: Draw the signature on the canvas
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

      // Step 2: Get image pixel data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Step 3: Loop through pixels and remove white background
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]; // Red
        const g = data[i + 1]; // Green
        const b = data[i + 2]; // Blue
        const alpha = data[i + 3]; // Alpha

        // If pixel is almost white, make it transparent
        if (r > 220 && g > 220 && b > 220) {
          data[i + 3] = 0; // Set alpha to 0 (transparent)
        }
      }

      // Step 4: Put modified pixels back on the canvas
      ctx.putImageData(imageData, 0, 0);
    };
  }, [signatureUrl]);

  return (
    <div className="signature__container__box">
      <canvas
        ref={canvasRef}
        className="signature-container"
        style={{
          pointerEvents: "none",
          userSelect: "none",
          background: "transparent",
          ...styles,
        }}
      />
    </div>
  );
};

export default SignatureCanvas;
