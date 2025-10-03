import { BaseRepository } from "app/Repositories/BaseRepository";
import { CarderResponseData } from "app/Repositories/Carder/data";
import { DepartmentResponseData } from "app/Repositories/Department/data";
import { GroupResponseData } from "app/Repositories/Group/data";
import { UserResponseData } from "app/Repositories/User/data";
import { WorkflowStageResponseData } from "app/Repositories/WorkflowStage/data";
import React, { useCallback, useEffect, useState } from "react";
import { ProjectResponseData } from "../Repositories/Project/data";
import { FundResponseData } from "../Repositories/Fund/data";
import { ClaimResponseData } from "../Repositories/Claim/data";

type HasId = { id: string | number };
export interface AccessibleResourceMap {
  users: UserResponseData & HasId;
  departments: DepartmentResponseData & HasId;
  groups: GroupResponseData & HasId;
  carders: CarderResponseData & HasId;
  workflowStages: WorkflowStageResponseData & HasId;
  projects: ProjectResponseData & HasId;
  funds: FundResponseData & HasId;
  claims: ClaimResponseData & HasId;
}

// Global cache to store fetched data
const cache = new Map<
  string,
  {
    data: any[];
    timestamp: number;
    ttl: number; // Time to live in milliseconds
  }
>();

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes default

const useCachedDirectories = <
  D extends BaseRepository,
  K extends keyof AccessibleResourceMap
>(
  Repo: D,
  api: K,
  options: {
    cacheKey?: string;
    ttl?: number;
    enabled?: boolean;
  } = {}
) => {
  const [collection, setCollection] = useState<AccessibleResourceMap[K][]>([]);
  const [resource, setResource] = useState<AccessibleResourceMap[K] | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<unknown>(null);

  const cacheKey = options.cacheKey || `${Repo.constructor.name}_${api}`;
  const ttl = options.ttl || CACHE_TTL;

  const fetchCollection = useCallback(async () => {
    try {
      setLoading(true);

      // Check cache first
      const cached = cache.get(cacheKey);
      const now = Date.now();

      if (cached && now - cached.timestamp < cached.ttl) {
        setCollection(cached.data as AccessibleResourceMap[K][]);
        setLoading(false);
        return;
      }

      // Fetch from API
      const { data } = await Repo.collection(api);
      if (data) {
        const collectionData = data as AccessibleResourceMap[K][];
        setCollection(collectionData);

        // Cache the result
        cache.set(cacheKey, {
          data: collectionData,
          timestamp: now,
          ttl: ttl,
        });
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [Repo, api, cacheKey, ttl]);

  const fetchRaw = useCallback(
    (param: string | number, key: keyof AccessibleResourceMap[K] = "id") => {
      if (!collection) return null;
      const raw = collection.find((resource) => resource[key] === param);
      setResource(raw ?? null);
    },
    [collection]
  );

  // Clear cache for this specific key
  const clearCache = useCallback(() => {
    cache.delete(cacheKey);
  }, [cacheKey]);

  // Clear all cache
  const clearAllCache = useCallback(() => {
    cache.clear();
  }, []);

  // Get cache statistics
  const getCacheStats = useCallback(() => {
    return {
      size: cache.size,
      keys: Array.from(cache.keys()),
      entries: Array.from(cache.entries()).map(([key, value]) => ({
        key,
        age: Date.now() - value.timestamp,
        ttl: value.ttl,
        expired: Date.now() - value.timestamp >= value.ttl,
      })),
    };
  }, []);

  useEffect(() => {
    if (options.enabled !== false) {
      fetchCollection();
    }
  }, [fetchCollection, options.enabled]);

  return {
    collection,
    loading,
    error,
    resource,
    fetchRaw,
    clearCache,
    clearAllCache,
    refetch: fetchCollection,
    getCacheStats,
  };
};

export default useCachedDirectories;
