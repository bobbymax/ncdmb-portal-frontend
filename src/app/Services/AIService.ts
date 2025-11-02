import axios from "axios";
import { AuthUserResponseData } from "../Context/AuthContext";
import { ApiService } from "./ApiService";

export interface AIRequestConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
}

export interface AIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface DocumentAnalysisResult {
  documentType: string;
  confidence: number;
  extractedData: Record<string, any>;
  summary?: string;
  keyEntities: Array<{
    name: string;
    type: string;
    value: string;
    confidence: number;
  }>;
  recommendations: string[];
}

export interface WorkflowRecommendation {
  action: string;
  confidence: number;
  reasoning: string;
  suggestedApprover?: string;
  priority: "low" | "medium" | "high";
}

export interface FraudDetectionResult {
  riskLevel: "low" | "medium" | "high" | "critical";
  confidence: number;
  anomalies: Array<{
    type: string;
    description: string;
    severity: "low" | "medium" | "high";
  }>;
  recommendations: string[];
}

export interface InboundAnalysisResult {
  summary: string;
  keyFeatures: string[];
  organizationalBenefits: string[];
  documentType?: string;
  confidence: number;
  urgency?: string;
  suggestedActions?: string[];
}

class AIService {
  private baseURL: string;
  private apiKey: string;
  private user: AuthUserResponseData | undefined;
  private apiService: ApiService;

  constructor() {
    this.baseURL =
      process.env.REACT_APP_AI_API_ENDPOINT || "https://api.openai.com/v1";
    this.apiKey = process.env.REACT_APP_AI_API_KEY || "";
    this.apiService = new ApiService();
  }

  setUser(user: AuthUserResponseData) {
    this.user = user;
  }

  private async makeRequest<T>(
    endpoint: string,
    data: any,
    config: AIRequestConfig = {}
  ): Promise<AIResponse<T>> {
    try {
      const response = await axios.post(
        `${this.baseURL}${endpoint}`,
        {
          ...data,
          model: config.model || "gpt-4",
          temperature: config.temperature || 0.3,
          max_tokens: config.maxTokens || 1000,
          user: this.user?.id?.toString() || "anonymous",
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          timeout: config.timeout || 30000,
        }
      );

      return {
        success: true,
        data: response.data,
        usage: response.data.usage,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
      };
    }
  }

  // Document Intelligence
  async analyzeDocument(
    content: string,
    documentType?: string,
    config?: AIRequestConfig
  ): Promise<AIResponse<DocumentAnalysisResult>> {
    const prompt = `
      Analyze the following document content and extract key information:
      
      Document Type: ${documentType || "Unknown"}
      Content: ${content}
      
      Please provide:
      1. Document type classification
      2. Extracted key data points
      3. Summary of the document
      4. Key entities (names, amounts, dates, etc.)
      5. Recommendations for processing
      
      Format the response as JSON with the following structure:
      {
        "documentType": "string",
        "confidence": number,
        "extractedData": {},
        "summary": "string",
        "keyEntities": [{"name": "string", "type": "string", "value": "string", "confidence": number}],
        "recommendations": ["string"]
      }
    `;

    return this.makeRequest<DocumentAnalysisResult>(
      "/chat/completions",
      {
        messages: [
          {
            role: "system",
            content:
              "You are an expert document analysis AI. Extract and classify information from documents accurately.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      },
      config
    );
  }

  // Workflow Intelligence
  async getWorkflowRecommendation(
    documentData: any,
    currentStage: string,
    userRole: string,
    config?: AIRequestConfig
  ): Promise<AIResponse<WorkflowRecommendation>> {
    const prompt = `
      Based on the following document and workflow context, provide recommendations:
      
      Document Data: ${JSON.stringify(documentData)}
      Current Stage: ${currentStage}
      User Role: ${userRole}
      
      Please provide workflow recommendations including:
      1. Next action to take
      2. Confidence level
      3. Reasoning
      4. Suggested approver (if applicable)
      5. Priority level
      
      Format as JSON:
      {
        "action": "string",
        "confidence": number,
        "reasoning": "string",
        "suggestedApprover": "string",
        "priority": "low|medium|high"
      }
    `;

    return this.makeRequest<WorkflowRecommendation>(
      "/chat/completions",
      {
        messages: [
          {
            role: "system",
            content:
              "You are an expert workflow optimization AI. Provide intelligent recommendations for document processing workflows.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      },
      config
    );
  }

  // Fraud Detection
  async detectFraud(
    transactionData: any,
    historicalData?: any[],
    config?: AIRequestConfig
  ): Promise<AIResponse<FraudDetectionResult>> {
    const prompt = `
      Analyze the following transaction for potential fraud:
      
      Transaction Data: ${JSON.stringify(transactionData)}
      Historical Context: ${
        historicalData ? JSON.stringify(historicalData) : "None"
      }
      
      Please provide fraud analysis including:
      1. Risk level assessment
      2. Confidence in the assessment
      3. Specific anomalies detected
      4. Recommendations for action
      
      Format as JSON:
      {
        "riskLevel": "low|medium|high|critical",
        "confidence": number,
        "anomalies": [{"type": "string", "description": "string", "severity": "low|medium|high"}],
        "recommendations": ["string"]
      }
    `;

    return this.makeRequest<FraudDetectionResult>(
      "/chat/completions",
      {
        messages: [
          {
            role: "system",
            content:
              "You are an expert fraud detection AI. Analyze transactions for suspicious patterns and provide risk assessments.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      },
      config
    );
  }

  // Natural Language Query Processing
  async processNaturalLanguageQuery(
    query: string,
    context: any,
    config?: AIRequestConfig
  ): Promise<AIResponse<any>> {
    const prompt = `
      Process the following natural language query in the context of a document management system:
      
      Query: "${query}"
      Context: ${JSON.stringify(context)}
      
      Convert this query into structured data that can be used to:
      1. Search for documents
      2. Filter data
      3. Generate reports
      4. Execute actions
      
      Provide the response as structured JSON that can be directly used by the application.
    `;

    return this.makeRequest(
      "/chat/completions",
      {
        messages: [
          {
            role: "system",
            content:
              "You are an expert natural language processing AI. Convert user queries into structured data for document management systems.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      },
      config
    );
  }

  // Inbound Document Intelligence
  async analyzeInboundDocument(
    documentText: string,
    boardDescription: string,
    senderInfo: {
      name: string;
      email: string;
      phone: string;
    },
    config?: AIRequestConfig,
    provider?: "openai" | "huggingface"
  ): Promise<AIResponse<InboundAnalysisResult>> {
    try {
      // Call backend API using ApiService (handles auth, identity markers, etc.)
      const response = await this.apiService.post<{
        success: boolean;
        data?: {
          analysis: InboundAnalysisResult;
          usage?: {
            prompt_tokens?: number;
            completion_tokens?: number;
            total_tokens?: number;
          };
        };
        message?: string;
      }>("ai/analyze-inbound", {
        documentText,
        boardDescription,
        senderInfo,
        config,
        provider,
      });

      // Handle the response structure properly
      if (response.data?.success) {
        const backendData = response.data?.data;

        // Check if we have the analysis data
        if (backendData?.analysis) {
          return {
            success: true,
            data: backendData.analysis,
            usage: backendData.usage
              ? {
                  promptTokens: backendData.usage.prompt_tokens || 0,
                  completionTokens: backendData.usage.completion_tokens || 0,
                  totalTokens: backendData.usage.total_tokens || 0,
                }
              : undefined,
          };
        }
      }

      return {
        success: false,
        error: response.data?.message || "AI analysis failed",
      };
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to analyze document",
      };
    }
  }
}

export default new AIService();
