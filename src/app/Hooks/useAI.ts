import { useState, useCallback, useEffect } from "react";
import { useAuth } from "../Context/AuthContext";
import AIService, {
  AIRequestConfig,
  AIResponse,
  DocumentAnalysisResult,
  WorkflowRecommendation,
  FraudDetectionResult,
} from "../Services/AIService";

export interface AIHookState {
  isLoading: boolean;
  error: string | null;
  lastResponse: AIResponse<any> | null;
}

export interface AIHookActions {
  analyzeDocument: (
    content: string,
    documentType?: string,
    config?: AIRequestConfig
  ) => Promise<AIResponse<DocumentAnalysisResult>>;

  getWorkflowRecommendation: (
    documentData: any,
    currentStage: string,
    userRole: string,
    config?: AIRequestConfig
  ) => Promise<AIResponse<WorkflowRecommendation>>;

  detectFraud: (
    transactionData: any,
    historicalData?: any[],
    config?: AIRequestConfig
  ) => Promise<AIResponse<FraudDetectionResult>>;

  processNaturalLanguageQuery: (
    query: string,
    context: any,
    config?: AIRequestConfig
  ) => Promise<AIResponse<any>>;

  clearError: () => void;
  reset: () => void;
}

export const useAI = (): AIHookState & AIHookActions => {
  const { staff } = useAuth();
  const [state, setState] = useState<AIHookState>({
    isLoading: false,
    error: null,
    lastResponse: null,
  });

  // Set user context when staff changes
  useEffect(() => {
    if (staff) {
      AIService.setUser(staff);
    }
  }, [staff]);

  const setLoading = useCallback((loading: boolean) => {
    setState((prev) => ({ ...prev, isLoading: loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, error }));
  }, []);

  const setResponse = useCallback((response: AIResponse<any>) => {
    setState((prev) => ({
      ...prev,
      lastResponse: response,
      error: response.success ? null : response.error || "Unknown error",
    }));
  }, []);

  const analyzeDocument = useCallback(
    async (
      content: string,
      documentType?: string,
      config?: AIRequestConfig
    ): Promise<AIResponse<DocumentAnalysisResult>> => {
      setLoading(true);
      setError(null);

      try {
        const response = await AIService.analyzeDocument(
          content,
          documentType,
          config
        );
        setResponse(response);
        return response;
      } catch (error: any) {
        const errorResponse: AIResponse<DocumentAnalysisResult> = {
          success: false,
          error: error.message || "Failed to analyze document",
        };
        setResponse(errorResponse);
        return errorResponse;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, setResponse]
  );

  const getWorkflowRecommendation = useCallback(
    async (
      documentData: any,
      currentStage: string,
      userRole: string,
      config?: AIRequestConfig
    ): Promise<AIResponse<WorkflowRecommendation>> => {
      setLoading(true);
      setError(null);

      try {
        const response = await AIService.getWorkflowRecommendation(
          documentData,
          currentStage,
          userRole,
          config
        );
        setResponse(response);
        return response;
      } catch (error: any) {
        const errorResponse: AIResponse<WorkflowRecommendation> = {
          success: false,
          error: error.message || "Failed to get workflow recommendation",
        };
        setResponse(errorResponse);
        return errorResponse;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, setResponse]
  );

  const detectFraud = useCallback(
    async (
      transactionData: any,
      historicalData?: any[],
      config?: AIRequestConfig
    ): Promise<AIResponse<FraudDetectionResult>> => {
      setLoading(true);
      setError(null);

      try {
        const response = await AIService.detectFraud(
          transactionData,
          historicalData,
          config
        );
        setResponse(response);
        return response;
      } catch (error: any) {
        const errorResponse: AIResponse<FraudDetectionResult> = {
          success: false,
          error: error.message || "Failed to detect fraud",
        };
        setResponse(errorResponse);
        return errorResponse;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, setResponse]
  );

  const processNaturalLanguageQuery = useCallback(
    async (
      query: string,
      context: any,
      config?: AIRequestConfig
    ): Promise<AIResponse<any>> => {
      setLoading(true);
      setError(null);

      try {
        const response = await AIService.processNaturalLanguageQuery(
          query,
          context,
          config
        );
        setResponse(response);
        return response;
      } catch (error: any) {
        const errorResponse: AIResponse<any> = {
          success: false,
          error: error.message || "Failed to process query",
        };
        setResponse(errorResponse);
        return errorResponse;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, setResponse]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      lastResponse: null,
    });
  }, []);

  return {
    ...state,
    analyzeDocument,
    getWorkflowRecommendation,
    detectFraud,
    processNaturalLanguageQuery,
    clearError,
    reset,
  };
};
