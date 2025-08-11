import { useState, useEffect, useCallback } from "react";
import { DocumentResponseData } from "@/app/Repositories/Document/data";
import { BaseRepository } from "@/app/Repositories/BaseRepository";

interface UseDocumentLoaderReturn {
  documentData: DocumentResponseData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useDocumentLoader = (
  Repository: BaseRepository,
  documentReference?: string
): UseDocumentLoaderReturn => {
  const [documentData, setDocumentData] = useState<DocumentResponseData | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocument = useCallback(async () => {
    if (!documentReference || !Repository) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Encode the reference to handle special characters
      const encodedRef = encodeURIComponent(documentReference);
      const response = await Repository.show("documents/ref", encodedRef);

      if (response && response.code === 200 && response.data) {
        setDocumentData(response.data as DocumentResponseData);
      } else if (response && response.status === "error") {
        setError(
          "Document not found. Please check the reference and try again."
        );
      } else {
        setError("Error fetching document. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching document:", error);
      if (error instanceof Error) {
        if (
          error.message.includes("network") ||
          error.message.includes("fetch")
        ) {
          setError(
            "Network error. Please check your connection and try again."
          );
        } else {
          setError("Error fetching document. Please try again.");
        }
      } else {
        setError("Error fetching document. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [Repository, documentReference]);

  const refetch = useCallback(() => {
    fetchDocument();
  }, [fetchDocument]);

  useEffect(() => {
    if (documentReference) {
      fetchDocument();
    }
  }, [fetchDocument, documentReference]);

  return {
    documentData,
    loading,
    error,
    refetch,
  };
};

export default useDocumentLoader;
