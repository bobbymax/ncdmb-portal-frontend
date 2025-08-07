import React from "react";
import {
  DocumentAnalysisResult,
  WorkflowRecommendation,
  FraudDetectionResult,
} from "app/Services/AIService";

interface AIAnalysisCardProps {
  type: "document" | "workflow" | "fraud";
  data: DocumentAnalysisResult | WorkflowRecommendation | FraudDetectionResult;
  isLoading?: boolean;
  onAction?: (action: string) => void;
  className?: string;
}

const AIAnalysisCard: React.FC<AIAnalysisCardProps> = ({
  type,
  data,
  isLoading = false,
  onAction,
  className = "",
}) => {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600";
    if (confidence >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return "High";
    if (confidence >= 0.6) return "Medium";
    return "Low";
  };

  const renderDocumentAnalysis = (analysis: DocumentAnalysisResult) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-gray-800">
          Document Analysis
        </h4>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(
            analysis.confidence
          )}`}
        >
          {getConfidenceLabel(analysis.confidence)} Confidence
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h5 className="font-medium text-gray-700 mb-2">Document Type</h5>
          <p className="text-sm text-gray-600">{analysis.documentType}</p>
        </div>

        <div>
          <h5 className="font-medium text-gray-700 mb-2">Confidence Score</h5>
          <div className="flex items-center">
            <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${analysis.confidence * 100}%` }}
              ></div>
            </div>
            <span className="text-sm text-gray-600">
              {Math.round(analysis.confidence * 100)}%
            </span>
          </div>
        </div>
      </div>

      {analysis.summary && (
        <div>
          <h5 className="font-medium text-gray-700 mb-2">Summary</h5>
          <p className="text-sm text-gray-600">{analysis.summary}</p>
        </div>
      )}

      {analysis.keyEntities && analysis.keyEntities.length > 0 && (
        <div>
          <h5 className="font-medium text-gray-700 mb-2">Key Entities</h5>
          <div className="flex flex-wrap gap-2">
            {analysis.keyEntities?.map((entity: any, index: number) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {entity.name}: {entity.value}
              </span>
            ))}
          </div>
        </div>
      )}

      {analysis.recommendations && analysis.recommendations.length > 0 && (
        <div>
          <h5 className="font-medium text-gray-700 mb-2">Recommendations</h5>
          <ul className="space-y-1">
            {analysis.recommendations?.map((rec: any, index: number) => (
              <li
                key={index}
                className="text-sm text-gray-600 flex items-start"
              >
                <span className="text-blue-500 mr-2">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const renderWorkflowRecommendation = (
    recommendation: WorkflowRecommendation
  ) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-gray-800">
          Workflow Recommendation
        </h4>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(
            recommendation.confidence
          )}`}
        >
          {getConfidenceLabel(recommendation.confidence)} Confidence
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h5 className="font-medium text-gray-700 mb-2">Recommended Action</h5>
          <p className="text-sm text-gray-600">{recommendation.action}</p>
        </div>

        <div>
          <h5 className="font-medium text-gray-700 mb-2">Priority</h5>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              recommendation.priority === "high"
                ? "bg-red-100 text-red-800"
                : recommendation.priority === "medium"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {recommendation.priority.charAt(0).toUpperCase() +
              recommendation.priority.slice(1)}
          </span>
        </div>
      </div>

      <div>
        <h5 className="font-medium text-gray-700 mb-2">Reasoning</h5>
        <p className="text-sm text-gray-600">{recommendation.reasoning}</p>
      </div>

      {recommendation.suggestedApprover && (
        <div>
          <h5 className="font-medium text-gray-700 mb-2">Suggested Approver</h5>
          <p className="text-sm text-gray-600">
            {recommendation.suggestedApprover}
          </p>
        </div>
      )}

      {onAction && (
        <button
          onClick={() => onAction(recommendation.action)}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Apply Recommendation
        </button>
      )}
    </div>
  );

  const renderFraudDetection = (fraud: FraudDetectionResult) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-gray-800">Fraud Detection</h4>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            fraud.riskLevel === "critical"
              ? "bg-red-100 text-red-800"
              : fraud.riskLevel === "high"
              ? "bg-orange-100 text-orange-800"
              : fraud.riskLevel === "medium"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {fraud.riskLevel.charAt(0).toUpperCase() + fraud.riskLevel.slice(1)}{" "}
          Risk
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h5 className="font-medium text-gray-700 mb-2">Risk Level</h5>
          <p className="text-sm text-gray-600 capitalize">{fraud.riskLevel}</p>
        </div>

        <div>
          <h5 className="font-medium text-gray-700 mb-2">Confidence</h5>
          <div className="flex items-center">
            <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
              <div
                className="bg-red-600 h-2 rounded-full"
                style={{ width: `${fraud.confidence * 100}%` }}
              ></div>
            </div>
            <span className="text-sm text-gray-600">
              {Math.round(fraud.confidence * 100)}%
            </span>
          </div>
        </div>
      </div>

      {fraud.anomalies && fraud.anomalies.length > 0 && (
        <div>
          <h5 className="font-medium text-gray-700 mb-2">Detected Anomalies</h5>
          <div className="space-y-2">
            {fraud.anomalies?.map((anomaly: any, index: number) => (
              <div
                key={index}
                className="p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-red-800">
                    {anomaly.type}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      anomaly.severity === "high"
                        ? "bg-red-100 text-red-800"
                        : anomaly.severity === "medium"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {anomaly.severity}
                  </span>
                </div>
                <p className="text-sm text-red-700">{anomaly.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {fraud.recommendations && fraud.recommendations.length > 0 && (
        <div>
          <h5 className="font-medium text-gray-700 mb-2">Recommendations</h5>
          <ul className="space-y-1">
            {fraud.recommendations?.map((rec: any, index: number) => (
              <li
                key={index}
                className="text-sm text-gray-600 flex items-start"
              >
                <span className="text-red-500 mr-2">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (type) {
      case "document":
        return renderDocumentAnalysis(data as DocumentAnalysisResult);
      case "workflow":
        return renderWorkflowRecommendation(data as WorkflowRecommendation);
      case "fraud":
        return renderFraudDetection(data as FraudDetectionResult);
      default:
        return <div>Unknown analysis type</div>;
    }
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md p-6 border border-gray-200 ${className}`}
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Analyzing...</span>
        </div>
      ) : (
        renderContent()
      )}
    </div>
  );
};

export default AIAnalysisCard;
