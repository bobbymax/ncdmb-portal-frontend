// utils/captureTemplatesToImages.ts
import html2canvas from "html2canvas";

const A4 = {
  portrait: { width: 2480, height: 3508 },
  landscape: { width: 3508, height: 2480 },
};

export const captureTemplatesToImages = async (): Promise<string[]> => {
  const containers =
    document.querySelectorAll<HTMLElement>(".template-capture");
  const dataUrls: string[] = [];

  for (const el of containers) {
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const img = new Image();
    img.src = canvas.toDataURL("image/png");

    await new Promise((resolve) => (img.onload = resolve));

    const orientation = img.width > img.height ? "landscape" : "portrait";
    const { width, height } = A4[orientation];

    const outputCanvas = document.createElement("canvas");
    const ctx = outputCanvas.getContext("2d");

    outputCanvas.width = width;
    outputCanvas.height = height;

    const scale = Math.min(width / img.width, height / img.height);
    const dx = (width - img.width * scale) / 2;
    const dy = (height - img.height * scale) / 2;

    ctx?.drawImage(
      img,
      0,
      0,
      img.width,
      img.height,
      dx,
      dy,
      img.width * scale,
      img.height * scale
    );

    dataUrls.push(outputCanvas.toDataURL("image/png"));
  }

  return dataUrls;
};
