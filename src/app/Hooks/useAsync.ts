import { useCallback, useState } from "react";
import { ServerResponse } from "../Services/RepositoryService";
import { DefaultErrorHandler } from "../Handlers/DefaultErrorHandler";

export interface DefaultError {
  message: string;
  code: number;
  context?: string;
  errors?: string | string[];
}

export const useAsync = <T extends ServerResponse>() => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (promise: Promise<T>) => {
    setLoading(true);
    setError(null);
    try {
      return await promise;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");

      const message =
        err instanceof Error ? err.message : "Something went wrong!!";
      const code = 500;
      const context = "Error in async operation";

      const er = new DefaultErrorHandler(message, code, context);

      throw er; // Re-throw to handle in the calling function
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, execute };
};
