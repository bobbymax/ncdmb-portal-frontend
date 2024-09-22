import { BaseRepository, JsonResponse } from "@repositories/BaseRepository";
import _ from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

interface RestData {
  shouldFetch?: boolean;
  hasParam?: boolean;
  customRoute?: string;
  param?: string;
}

export const useResourceActions = <T extends BaseRepository>(
  Repository: new () => T,
  { shouldFetch = false, hasParam = false, param = "" }: RestData
) => {
  const params = useParams<{ [key: string]: string }>();
  const [collection, setCollection] = useState<JsonResponse[]>([]);
  const [raw, setRaw] = useState<JsonResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [resourceError, setResourceError] = useState<string | null>(null);

  const repo = useMemo(() => new Repository(), [Repository]);

  const fetchCollection = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setResourceError(null);
      try {
        const { data } = await repo.collection();
        setCollection(Array.isArray(data) ? data : [data]);
      } catch (err: unknown) {
        handleError(err, signal);
      } finally {
        setLoading(false);
      }
    },
    [repo]
  );

  const fetchRawServerRecord = useCallback(
    async (value: string | number, signal?: AbortSignal) => {
      setLoading(true);
      setResourceError(null);
      try {
        const { data } = await repo.show(value);
        setRaw(Array.isArray(data) ? null : _.isObject(data) ? data : null);
      } catch (err: unknown) {
        handleError(err, signal);
      } finally {
        setLoading(false);
      }
    },
    [repo]
  );

  const handleError = (err: unknown, signal?: AbortSignal) => {
    if (signal?.aborted) {
      console.log("Fetch aborted");
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

  useEffect(() => {
    if (shouldFetch) {
      const controller = new AbortController();
      const { signal } = controller;

      fetchCollection(signal);

      return () => controller.abort();
    }
  }, [fetchCollection, shouldFetch]);

  useEffect(() => {
    if (hasParam && params[0]) {
      const controller = new AbortController();
      const { signal } = controller;

      const value = param ? params[param] : params.id;
      fetchRawServerRecord(value as string, signal);

      return () => controller.abort();
    }
  }, [hasParam, fetchRawServerRecord, param, params]);

  return { collection, raw, updateCollection, resourceError, loading };
};
