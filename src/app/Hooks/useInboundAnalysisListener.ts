import { useEffect, useState, useCallback } from "react";
import { echo } from "lib/echo";
import { InboundAnalysisResult } from "app/Services/AIService";
import { ApiService } from "app/Services/ApiService";

export type AnalysisStep = 
  | "idle"
  | "queueing"
  | "extracting"
  | "analyzing"
  | "completing"
  | "done";

interface UseInboundAnalysisListenerReturn {
  analysis: InboundAnalysisResult | null;
  isAnalyzing: boolean;
  error: string | null;
  loadingStep: AnalysisStep;
  triggerAnalysis: (provider?: "openai" | "huggingface") => Promise<void>;
}

export const useInboundAnalysisListener = (
  inboundId: number | undefined
): UseInboundAnalysisListenerReturn => {
  const [analysis, setAnalysis] = useState<InboundAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState<AnalysisStep>("idle");
  const apiService = new ApiService();

  // Trigger manual analysis
  const triggerAnalysis = useCallback(
    async (provider: "openai" | "huggingface" = "openai") => {
      if (!inboundId) {
        setError("No inbound ID provided");
        return;
      }

      setIsAnalyzing(true);
      setError(null);
      setLoadingStep("queueing");

      try {
        const response = await apiService.post<{
          success: boolean;
          message: string;
        }>(`inbounds/${inboundId}/analyze`, {
          provider,
        });

        if (response.data?.success) {
          // Analysis will come via Pusher event
          // Simulate progression through steps
          setTimeout(() => setLoadingStep("extracting"), 1000);
          setTimeout(() => setLoadingStep("analyzing"), 3000);
        } else {
          setError("Failed to queue analysis job");
          setIsAnalyzing(false);
          setLoadingStep("idle");
        }
      } catch (err: any) {
        setError(err.message || "Failed to trigger analysis");
        setIsAnalyzing(false);
        setLoadingStep("idle");
      }
    },
    [inboundId, apiService]
  );

  // Listen for Pusher events
  useEffect(() => {
    if (!inboundId) return;

    const channel = echo.private(`inbound.${inboundId}`);

    // Listen for analysis completion
    channel.listen("InboundAnalysisCompleted", (event: any) => {
      setLoadingStep("completing");
      setTimeout(() => {
        setAnalysis(event.analysis);
        setIsAnalyzing(false);
        setError(null);
        setLoadingStep("done");
      }, 500);
    });

    // Listen for analysis errors
    channel.listen("InboundAnalysisFailed", (event: any) => {
      setError(event.error || "Analysis failed");
      setIsAnalyzing(false);
      setLoadingStep("idle");
    });

    // Cleanup on unmount
    return () => {
      channel.stopListening("InboundAnalysisCompleted");
      channel.stopListening("InboundAnalysisFailed");
      echo.leaveChannel(`inbound.${inboundId}`);
    };
  }, [inboundId]);

  return {
    analysis,
    isAnalyzing,
    error,
    loadingStep,
    triggerAnalysis,
  };
};

