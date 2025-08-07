import React, { useState } from "react";
import { useAI } from "app/Hooks/useAI";
import AISearchBar from "./AISearchBar";
import AIAnalysisCard from "./AIAnalysisCard";
import {
  DocumentAnalysisResult,
  WorkflowRecommendation,
  FraudDetectionResult,
} from "app/Services/AIService";

const AIExampleComponent: React.FC = () => {
  const {
    analyzeDocument,
    getWorkflowRecommendation,
    detectFraud,
    isLoading,
    error,
  } = useAI();
  const [documentAnalysis, setDocumentAnalysis] =
    useState<DocumentAnalysisResult | null>(null);
  const [workflowRecommendation, setWorkflowRecommendation] =
    useState<WorkflowRecommendation | null>(null);
  const [fraudDetection, setFraudDetection] =
    useState<FraudDetectionResult | null>(null);

  const handleDocumentAnalysis = async () => {
    const sampleContent = `
      INVOICE
      
      Invoice Number: INV-2024-001
      Date: 2024-01-15
      Due Date: 2024-02-15
      
      Bill To:
      John Doe
      123 Main Street
      City, State 12345
      
      Items:
      1. Web Development Services - $5,000
      2. Design Consultation - $1,500
      
      Subtotal: $6,500
      Tax: $650
      Total: $7,150
      
      Payment Terms: Net 30
    `;

    const result = await analyzeDocument(sampleContent, "invoice");

    if (result.success && result.data) {
      setDocumentAnalysis(result.data);
    }
  };

  const handleWorkflowRecommendation = async () => {
    const sampleDocumentData = {
      type: "invoice",
      amount: 7150,
      vendor: "John Doe",
      dueDate: "2024-02-15",
      status: "pending_approval",
    };

    const result = await getWorkflowRecommendation(
      sampleDocumentData,
      "review",
      "manager"
    );

    if (result.success && result.data) {
      setWorkflowRecommendation(result.data);
    }
  };

  const handleFraudDetection = async () => {
    const sampleTransaction = {
      amount: 50000,
      vendor: "Unknown Vendor",
      description: "Consulting Services",
      date: "2024-01-15",
      user: "john.doe@company.com",
    };

    const result = await detectFraud(sampleTransaction);

    if (result.success && result.data) {
      setFraudDetection(result.data);
    }
  };

  const handleSearch = (query: string, aiProcessedQuery?: any) => {
    if (aiProcessedQuery) {
      //
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          AI Integration Example
        </h2>
        <p className="text-gray-600 mb-6">
          This component demonstrates the AI features available in the
          application.
        </p>

        {/* AI Search Bar */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            AI-Powered Search
          </h3>
          <AISearchBar
            onSearch={handleSearch}
            placeholder="Try: 'show me invoices from last month'"
            context={{ documentTypes: ["invoice", "contract", "report"] }}
          />
        </div>

        {/* AI Analysis Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={handleDocumentAnalysis}
            disabled={isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? "Analyzing..." : "Analyze Document"}
          </button>

          <button
            onClick={handleWorkflowRecommendation}
            disabled={isLoading}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {isLoading ? "Processing..." : "Get Workflow Recommendation"}
          </button>

          <button
            onClick={handleFraudDetection}
            disabled={isLoading}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {isLoading ? "Detecting..." : "Detect Fraud"}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">Error: {error}</p>
          </div>
        )}

        {/* AI Analysis Results */}
        <div className="space-y-6">
          {documentAnalysis && (
            <AIAnalysisCard
              type="document"
              data={documentAnalysis}
              onAction={(action) => {
                // Handle document action
              }}
            />
          )}

          {workflowRecommendation && (
            <AIAnalysisCard
              type="workflow"
              data={workflowRecommendation}
              onAction={(action) => {
                // Handle workflow action
              }}
            />
          )}

          {fraudDetection && (
            <AIAnalysisCard type="fraud" data={fraudDetection} />
          )}
        </div>

        {/* Usage Instructions */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            How to Use AI Features
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>
              • <strong>Document Analysis:</strong> Automatically extracts key
              information from documents
            </p>
            <p>
              • <strong>Workflow Recommendations:</strong> Suggests next actions
              based on document content
            </p>
            <p>
              • <strong>Fraud Detection:</strong> Identifies suspicious patterns
              in transactions
            </p>
            <p>
              • <strong>Natural Language Search:</strong> Search using plain
              English queries
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIExampleComponent;
