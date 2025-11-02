import { useState, useCallback } from "react";
import AIService, {
  AIResponse,
  InboundAnalysisResult,
} from "../Services/AIService";
import { extractTextFromMultiplePdfs } from "../Support/PdfTextExtractor";
import { UploadResponseData } from "../Repositories/Document/data";

interface UseInboundAIReturn {
  analysis: InboundAnalysisResult | null;
  isAnalyzing: boolean;
  error: string | null;
  provider: "openai" | "huggingface";
  setProvider: (provider: "openai" | "huggingface") => void;
  analyzeInbound: (
    uploads: UploadResponseData[],
    senderInfo: { name: string; email: string; phone: string }
  ) => Promise<void>;
  clearAnalysis: () => void;
}

export const useInboundAI = (): UseInboundAIReturn => {
  const [analysis, setAnalysis] = useState<InboundAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<"openai" | "huggingface">("openai");

  const boardDescription = `
    The Nigerian Content Development and Monitoring Board (NCDMB) is responsible for:
    - Monitoring and coordinating Nigerian content development in the oil and gas industry
    - Implementing Nigerian content policies and guidelines
    - Ensuring compliance with local content requirements
    - Promoting capacity building and technology transfer
    - Supporting local businesses in the oil and gas sector
    - Managing funds and grants for Nigerian content initiatives
    - Facilitating partnerships between local and international companies
  `;

  const analyzeInbound = useCallback(
    async (
      uploads: UploadResponseData[],
      senderInfo: { name: string; email: string; phone: string }
    ) => {
      if (!uploads || uploads.length === 0) {
        setError("No documents to analyze");
        return;
      }

      setIsAnalyzing(true);
      setError(null);

      try {
        // Step 1: Extract text from all PDF uploads
        console.log("Extracting text from PDFs...");
        const extractedText = await extractTextFromMultiplePdfs(uploads);

        if (!extractedText || extractedText.trim().length === 0) {
          setError(
            "Could not extract text from PDFs. Documents may be scanned images."
          );
          setIsAnalyzing(false);
          return;
        }

        console.log(
          `Text extracted successfully, sending to AI (${provider})...`
        );

        // Step 2: Send to AI for analysis
        const aiResponse = await AIService.analyzeInboundDocument(
          extractedText,
          boardDescription,
          senderInfo,
          {
            temperature: 0.3,
            maxTokens: 1400, // Reduced to fit in 8K context window
          },
          provider // Pass the selected provider
        );

        console.log("🎯 AI Response received:", aiResponse);

        if (aiResponse.success && aiResponse.data) {
          // AIService already returns parsed InboundAnalysisResult
          const analysisData = aiResponse.data as InboundAnalysisResult;

          console.log("✅ AI Analysis completed:", analysisData);
          setAnalysis(analysisData);
        } else {
          console.error("❌ AI Analysis failed:", aiResponse.error);
          setError(aiResponse.error || "AI analysis failed");
        }
      } catch (err: any) {
        console.error("Error in AI analysis:", err);
        setError(err.message || "Failed to analyze document");
      } finally {
        setIsAnalyzing(false);
      }
    },
    []
  );

  const clearAnalysis = useCallback(() => {
    setAnalysis(null);
    setError(null);
  }, []);

  return {
    analysis,
    isAnalyzing,
    error,
    provider,
    setProvider,
    analyzeInbound,
    clearAnalysis,
  };
};
