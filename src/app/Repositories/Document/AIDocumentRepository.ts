import { DocumentResponseData } from "./data";
import DocumentRepository from "./DocumentRepository";
import { useAI } from "../../Hooks/useAI";
import {
  AIResponse,
  DocumentAnalysisResult,
  WorkflowRecommendation,
  FraudDetectionResult,
} from "../../Services/AIService";

export interface AIEnhancedData {
  aiAnalysis?: DocumentAnalysisResult;
  workflowRecommendation?: WorkflowRecommendation;
  fraudDetection?: FraudDetectionResult;
  lastAnalyzed?: Date;
  aiConfidence?: number;
}

export class AIDocumentRepository extends DocumentRepository {
  protected aiData: AIEnhancedData = {};

  // AI-enhanced document analysis
  async analyzeDocument(
    id: number
  ): Promise<DocumentResponseData & AIEnhancedData> {
    const document = this.getState() as DocumentResponseData;

    if (!document) {
      throw new Error("Document not found");
    }

    return this.enrichWithAI(document);
  }

  // AI-enhanced document search
  async searchDocumentsWithAI(query: string): Promise<DocumentResponseData[]> {
    const { processNaturalLanguageQuery } = useAI();

    const context = {
      documentTypes: ["invoice", "contract", "report", "proposal", "receipt"],
      searchFields: ["title", "description", "file_path"],
    };

    const processedQuery = await processNaturalLanguageQuery(query, context);

    if (processedQuery.success && processedQuery.data) {
      // Use AI-processed query for enhanced search
      // This would need to be implemented based on your search logic
      return [];
    }

    return [];
  }

  // AI-enhanced document classification
  async classifyDocument(
    id: number
  ): Promise<DocumentResponseData & AIEnhancedData> {
    const document = this.getState() as DocumentResponseData;

    if (!document) {
      throw new Error("Document not found");
    }

    const analysis = await this.analyzeDocumentContent(document);

    if (analysis.success && analysis.data) {
      // Update document with AI classification
      const updatedDocument = {
        ...document,
        document_type: document.document_type
          ? {
              ...document.document_type,
              name: analysis.data.documentType,
            }
          : null,
        aiAnalysis: analysis.data,
        lastAnalyzed: new Date(),
        aiConfidence: analysis.data.confidence,
      } as DocumentResponseData & AIEnhancedData;

      return updatedDocument;
    }

    return document;
  }

  // AI-enhanced document summarization
  async summarizeDocument(
    id: number
  ): Promise<{ summary: string; keyPoints: string[] }> {
    const document = this.getState() as DocumentResponseData;

    if (!document) {
      throw new Error("Document not found");
    }

    const analysis = await this.analyzeDocumentContent(document);

    if (analysis.success && analysis.data) {
      return {
        summary: analysis.data.summary || "No summary available",
        keyPoints: analysis.data.recommendations || [],
      };
    }

    return {
      summary: "Unable to generate summary",
      keyPoints: [],
    };
  }

  // AI-enhanced document validation
  async validateDocument(
    id: number
  ): Promise<{ isValid: boolean; issues: string[]; suggestions: string[] }> {
    const document = this.getState() as DocumentResponseData;

    if (!document) {
      throw new Error("Document not found");
    }

    const validation = await this.validateWithAI(document);

    return {
      isValid: validation.isValid,
      issues: validation.isValid ? [] : ["Document validation failed"],
      suggestions: validation.suggestions,
    };
  }

  // AI-enhanced workflow recommendations for documents
  async getDocumentWorkflowRecommendation(
    documentId: number,
    currentStage: string,
    userRole: string
  ): Promise<AIEnhancedData["workflowRecommendation"]> {
    const document = this.getState() as DocumentResponseData;

    if (!document) {
      throw new Error("Document not found");
    }

    const { getWorkflowRecommendation } = useAI();

    const recommendation = await getWorkflowRecommendation(
      document,
      currentStage,
      userRole
    );

    return recommendation.success ? recommendation.data : undefined;
  }

  // AI-enhanced document comparison
  async compareDocuments(
    doc1Id: number,
    doc2Id: number
  ): Promise<{
    similarity: number;
    differences: string[];
    recommendations: string[];
  }> {
    const doc1 = this.getState() as DocumentResponseData;
    const doc2 = this.getState() as DocumentResponseData;

    if (!doc1 || !doc2) {
      throw new Error("One or both documents not found");
    }

    const [analysis1, analysis2] = await Promise.all([
      this.analyzeDocumentContent(doc1),
      this.analyzeDocumentContent(doc2),
    ]);

    if (
      analysis1.success &&
      analysis2.success &&
      analysis1.data &&
      analysis2.data
    ) {
      // Simple similarity calculation based on document types and extracted data
      const typeSimilarity =
        analysis1.data.documentType === analysis2.data.documentType ? 1 : 0;
      const confidenceSimilarity = Math.abs(
        analysis1.data.confidence - analysis2.data.confidence
      );

      const similarity = (typeSimilarity + (1 - confidenceSimilarity)) / 2;

      return {
        similarity,
        differences: [
          `Document types: ${analysis1.data.documentType} vs ${analysis2.data.documentType}`,
          `Confidence levels: ${analysis1.data.confidence} vs ${analysis2.data.confidence}`,
        ],
        recommendations: [
          ...analysis1.data.recommendations,
          ...analysis2.data.recommendations,
        ],
      };
    }

    return {
      similarity: 0,
      differences: ["Unable to compare documents"],
      recommendations: [],
    };
  }

  // Helper methods
  private hasDocumentContent(data: DocumentResponseData): boolean {
    return !!(data.description || data.title);
  }

  private extractDocumentContent(data: DocumentResponseData): string {
    const contentParts = [];

    if (data.title) contentParts.push(`Title: ${data.title}`);
    if (data.description) contentParts.push(`Description: ${data.description}`);
    if (data.file_path) contentParts.push(`File Path: ${data.file_path}`);
    if (data.document_template)
      contentParts.push(`Template: ${data.document_template}`);

    return contentParts.join("\n\n");
  }

  private getDocumentType(data: DocumentResponseData): string {
    return data.document_type?.name || "Unknown";
  }

  private async analyzeDocumentContent(
    data: DocumentResponseData
  ): Promise<AIResponse<DocumentAnalysisResult>> {
    const { analyzeDocument } = useAI();

    return analyzeDocument(
      this.extractDocumentContent(data),
      this.getDocumentType(data)
    );
  }

  private async validateWithAI(
    data: DocumentResponseData
  ): Promise<{ isValid: boolean; suggestions: string[] }> {
    const { analyzeDocument } = useAI();

    if (this.hasDocumentContent(data)) {
      const analysis = await analyzeDocument(
        this.extractDocumentContent(data),
        this.getDocumentType(data)
      );

      if (analysis.success && analysis.data) {
        return {
          isValid: analysis.data.confidence > 0.7,
          suggestions: analysis.data.recommendations || [],
        };
      }
    }

    return { isValid: true, suggestions: [] };
  }

  private async enrichWithAI(
    data: DocumentResponseData
  ): Promise<DocumentResponseData & AIEnhancedData> {
    const enrichedData = { ...data } as DocumentResponseData & AIEnhancedData;

    if (this.hasDocumentContent(data)) {
      const analysis = await this.analyzeDocumentContent(data);
      if (analysis.success && analysis.data) {
        Object.assign(enrichedData, {
          aiAnalysis: analysis.data,
          lastAnalyzed: new Date(),
          aiConfidence: analysis.data.confidence,
        });
      }
    }

    return enrichedData;
  }

  // Get AI-enhanced data
  getAIData(): AIEnhancedData {
    return this.aiData;
  }

  // Clear AI data
  clearAIData(): void {
    this.aiData = {};
  }

  // Update AI data
  updateAIData(aiData: Partial<AIEnhancedData>): void {
    this.aiData = { ...this.aiData, ...aiData };
  }
}
