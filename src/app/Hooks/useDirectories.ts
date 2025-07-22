import { BaseRepository } from "app/Repositories/BaseRepository";
import { CarderResponseData } from "app/Repositories/Carder/data";
import { DepartmentResponseData } from "app/Repositories/Department/data";
import { GroupResponseData } from "app/Repositories/Group/data";
import { UserResponseData } from "app/Repositories/User/data";
import { WorkflowStageResponseData } from "app/Repositories/WorkflowStage/data";
import React, { useCallback, useEffect, useState } from "react";

type HasId = { id: string | number };
export interface AccessibleResourceMap {
  users: UserResponseData & HasId;
  departments: DepartmentResponseData & HasId;
  groups: GroupResponseData & HasId;
  carders: CarderResponseData & HasId;
  workflowStages: WorkflowStageResponseData & HasId;
}

const useDirectories = <
  D extends BaseRepository,
  K extends keyof AccessibleResourceMap
>(
  Repo: D,
  api: K
) => {
  const [collection, setCollection] = useState<AccessibleResourceMap[K][]>([]);
  const [resource, setResource] = useState<AccessibleResourceMap[K] | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<unknown>(null);

  const fetchCollection = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await Repo.collection(api); // assuming api is needed
      if (data) {
        setCollection(data as AccessibleResourceMap[K][]);
      }
    } catch (err) {
      console.error("Failed to fetch directory:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [Repo, api]);

  const fetchRaw = useCallback(
    (param: string | number, key: keyof AccessibleResourceMap[K] = "id") => {
      if (!collection) return null;

      const raw = collection.find((resource) => resource[key] === param);
      setResource(raw ?? null);
    },
    [collection]
  );

  useEffect(() => {
    fetchCollection();
  }, [fetchCollection]);

  return { collection, loading, error, resource, fetchRaw };
};

export default useDirectories;
