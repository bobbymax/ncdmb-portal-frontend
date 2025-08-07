import { useStateContext } from "app/Context/ContentContext";
import {
  BaseRepository,
  JsonResponse,
  ViewsProps,
} from "../Repositories/BaseRepository";
import _ from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

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
  const [resourceError, setResourceError] = useState<string | null>(null);

  const repo = useMemo(() => Repository, [Repository]);

  const back = () => {
    navigate(-1);
  };

  const fetchCollection = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setComponentLoading(true);
      setResourceError(null);
      try {
        const { data } = await repo.collection(View.server_url);
        setCollection(Array.isArray(data) ? data : [data]);
      } catch (err: unknown) {
        handleError(err, signal);
      } finally {
        setLoading(false);
        setComponentLoading(false);
      }
    },
    [View.server_url, repo]
  );

  const fetchRawServerRecord = useCallback(
    async (value: string | number, signal?: AbortSignal) => {
      setLoading(true);
      setResourceError(null);
      try {
        const { data } = await repo.show(View.server_url, value);
        setRaw(Array.isArray(data) ? null : _.isObject(data) ? data : null);
      } catch (err: unknown) {
        handleError(err, signal);
      } finally {
        setLoading(false);
      }
    },
    [View.server_url, repo]
  );

  const handleError = (err: unknown, signal?: AbortSignal) => {
    if (signal?.aborted) {
      // Fetch aborted
    } else {
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
            console.warn("Unknown action provided:", action);
            return prevCollection;
        }
      });
    },
    []
  );

  const refreshRaw = (data: JsonResponse) => {
    setRaw(data);
  };

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
    refreshRaw,
    columns: repo.columns,
    buttons: repo.actions,
  };
};
