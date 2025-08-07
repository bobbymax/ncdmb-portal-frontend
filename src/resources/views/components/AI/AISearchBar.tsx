import React, { useState, useCallback, useEffect } from "react";
import { useAI } from "app/Hooks/useAI";

interface AISearchBarProps {
  onSearch: (query: string, aiProcessedQuery?: any) => void;
  placeholder?: string;
  className?: string;
  context?: any;
  showAIIndicator?: boolean;
}

const AISearchBar: React.FC<AISearchBarProps> = ({
  onSearch,
  placeholder = "Search with natural language...",
  className = "",
  context,
  showAIIndicator = true,
}) => {
  const [query, setQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiProcessed, setAiProcessed] = useState(false);
  const { processNaturalLanguageQuery, isLoading } = useAI();

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;

    setIsProcessing(true);
    setAiProcessed(false);

    try {
      // Try to process with AI first
      const aiResponse = await processNaturalLanguageQuery(query, context);

      if (aiResponse.success && aiResponse.data) {
        setAiProcessed(true);
        onSearch(query, aiResponse.data);
      } else {
        // Fallback to regular search
        onSearch(query);
      }
    } catch (error) {
      // Fallback to regular search on error
      onSearch(query);
    } finally {
      setIsProcessing(false);
    }
  }, [query, context, processNaturalLanguageQuery, onSearch]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    },
    [handleSearch]
  );

  const handleClear = useCallback(() => {
    setQuery("");
    setAiProcessed(false);
    onSearch("");
  }, [onSearch]);

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading || isProcessing}
          />

          {/* Search Icon */}
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* AI Indicator */}
          {showAIIndicator && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {isLoading || isProcessing ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="ml-1 text-xs text-blue-600">AI</span>
                </div>
              ) : aiProcessed ? (
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="ml-1 text-xs text-green-600">AI</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="ml-1 text-xs text-gray-400">AI</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          disabled={isLoading || isProcessing || !query.trim()}
          className="ml-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading || isProcessing ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing
            </div>
          ) : (
            "Search"
          )}
        </button>

        {/* Clear Button */}
        {query && (
          <button
            onClick={handleClear}
            className="ml-2 px-3 py-3 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* AI Processing Status */}
      {aiProcessed && (
        <div className="mt-2 text-sm text-green-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          AI enhanced search applied
        </div>
      )}

      {/* Example Queries */}
      {!query && (
        <div className="mt-2 text-xs text-gray-500">
          <p>
            Try: &quot;show me invoices from last month&quot; or &quot;documents
            pending approval&quot;
          </p>
        </div>
      )}
    </div>
  );
};

export default AISearchBar;
