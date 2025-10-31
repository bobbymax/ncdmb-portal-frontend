import { useStateContext } from "app/Context/ContentContext";
import {
  BaseRepository,
  JsonResponse,
  ViewsProps,
  PaginatedResponse,
  PaginationMeta,
} from "../Repositories/BaseRepository";
import { ServerResponse } from "../Services/RepositoryService";
import _ from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useRequestManager } from "app/Context/RequestManagerContext";
import { handleGlobalError } from "app/Services/ErrorService";

interface RestData {
  shouldFetch?: boolean;
  hasParam?: boolean;
  customRoute?: string;
  param?: string;
}

export const useResourceActions = <T extends BaseRepository>(
  Repository: T,
  View: ViewsProps,
  { shouldFetch = true, hasParam = false, param = "" }: RestData
) => {
  const { setComponentLoading } = useStateContext();
  const params = useParams<{ [key: string]: string }>();
  const navigate = useNavigate();
  const [collection, setCollection] = useState<JsonResponse[]>([]);
  const [raw, setRaw] = useState<JsonResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [resourceError, setResourceError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  const repo = useMemo(() => Repository, [Repository]);
  const { addRequest } = useRequestManager();

  // Type guard to check if response is paginated
  const isPaginatedResponse = useCallback(
    (data: any): data is PaginatedResponse => {
      return (
        data &&
        typeof data === "object" &&
        "current_page" in data &&
        "last_page" in data &&
        "data" in data &&
        Array.isArray(data.data)
      );
    },
    []
  );

  const back = () => {
    navigate(-1);
  };

  const fetchCollection = useCallback(
    async (signal?: AbortSignal, page = 1, append = false) => {
      // Set appropriate loading state
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setComponentLoading(true);
      }

      setResourceError(null);

      try {
        const response = await addRequest(() =>
          repo.collection(View.server_url, { page })
        );

        // New backend format: { status, message, data: [...], current_page, last_page, ... }
        // Pagination keys are at root level alongside 'data'
        const hasPaginationAtRoot =
          response && "current_page" in response && "last_page" in response;

        // Handle paginated response - pagination keys at response root
        if (hasPaginationAtRoot && Array.isArray(response.data)) {
          const documents = response.data as JsonResponse[];

          // Append to existing collection or replace
          if (append) {
            setCollection((prev) => [...prev, ...documents]);
          } else {
            setCollection(documents);
          }

          // Store pagination metadata
          setPagination({
            currentPage: response.current_page ?? 1,
            lastPage: response.last_page ?? 1,
            total: response.total ?? 0,
            perPage: response.per_page ?? 50,
            hasMore: (response.current_page ?? 1) < (response.last_page ?? 1),
            from: response.from ?? null,
            to: response.to ?? null,
          });
        }
        // Handle non-paginated response (backward compatible)
        else {
          const data = response?.data || response;
          setCollection(
            Array.isArray(data)
              ? (data as JsonResponse[])
              : [data as JsonResponse]
          );
          setPagination(null);
        }
      } catch (err: unknown) {
        handleError(err, signal);
      } finally {
        setLoading(false);
        setComponentLoading(false);
        setLoadingMore(false);
      }
    },
    [
      View.server_url,
      repo,
      addRequest,
      setComponentLoading,
      isPaginatedResponse,
    ]
  );

  const fetchRawServerRecord = useCallback(
    async (value: string | number, signal?: AbortSignal) => {
      setLoading(true);
      setResourceError(null);
      try {
        const { data } = await addRequest(() =>
          repo.show(View.server_url, value)
        );

        // Handle paginated response (shouldn't happen for show, but be safe)
        if (isPaginatedResponse(data)) {
          // If somehow show returns paginated, take first item
          setRaw(data.data[0] || null);
        } else {
          setRaw(Array.isArray(data) ? null : _.isObject(data) ? data : null);
        }
      } catch (err: unknown) {
        handleError(err, signal);
      } finally {
        setLoading(false);
      }
    },
    [View.server_url, repo, addRequest, isPaginatedResponse]
  );

  const handleError = (err: unknown, signal?: AbortSignal) => {
    if (signal?.aborted) {
      // Fetch aborted - don't show error
      return;
    }

    // Use the new error handling system
    try {
      const appError = handleGlobalError(
        err,
        {
          component: "useResourceActions",
          url: View.server_url,
        },
        {
          showToast: true,
          silent: false,
        }
      );

      setResourceError(appError.message);
    } catch (fallbackErr) {
      // Fallback to simple error handling if ErrorService fails
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch data.";
      setResourceError(errorMessage);
    }
  };

  const updateCollection = useCallback(
    (data: JsonResponse, action: "store" | "update" | "destroy") => {
      setCollection((prevCollection) => {
        switch (action) {
          case "store":
            return [data, ...prevCollection];
          case "destroy":
            return prevCollection.filter((item) => item.id !== data.id);
          case "update":
            return prevCollection.map((item) =>
              item.id === data.id ? data : item
            );
          default:
            // Unknown action provided
            return prevCollection;
        }
      });
    },
    []
  );

  const refreshRaw = (data: JsonResponse) => {
    setRaw(data);
  };

  // Load next page of results
  const loadMore = useCallback(() => {
    if (pagination && pagination.hasMore && !loadingMore) {
      fetchCollection(undefined, pagination.currentPage + 1, true);
    }
  }, [pagination, loadingMore, fetchCollection]);

  // Refresh collection (reload from page 1)
  const refresh = useCallback(() => {
    fetchCollection();
  }, [fetchCollection]);

  useEffect(() => {
    if (shouldFetch) {
      const controller = new AbortController();
      const { signal } = controller;

      fetchCollection(signal);

      return () => controller.abort();
    }
  }, [fetchCollection, shouldFetch]);

  useEffect(() => {
    if (hasParam && params) {
      const controller = new AbortController();
      const { signal } = controller;

      const value = param !== "" ? params[param] : params.id;
      if (value) {
        fetchRawServerRecord(value as string, signal);
      }

      return () => controller.abort();
    }
  }, [hasParam, fetchRawServerRecord, param, params]);

  return {
    back,
    redirectTo: navigate,
    collection,
    raw,
    updateCollection,
    resourceError,
    loading,
    loadingMore,
    refreshRaw,
    columns: repo.columns,
    buttons: repo.actions,
    pagination,
    loadMore,
    refresh,
  };
};
