import { BaseRepository } from "app/Repositories/BaseRepository";
import { GroupResponseData } from "app/Repositories/Group/data";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useRequestManager } from "app/Context/RequestManagerContext";

const useRepo = <D extends BaseRepository>(Repo: D) => {
  const repo = useMemo(() => Repo, [Repo]);
  const [dependencies, setDependencies] = useState<unknown>({});
  const [groups, setGroups] = useState<GroupResponseData[]>([]);
  const [hasFetched, setHasFetched] = useState(false);
  const { addRequest } = useRequestManager();

  const resourceDependencies = useCallback(async () => {
    try {
      const response = await addRequest(() => repo.dependencies());
      setDependencies(response);
    } catch (error) {
      // Error fetching dependencies
    }
  }, [repo, addRequest]);

  const getGroups = useCallback(async () => {
    try {
      const response = await addRequest(() => repo.collection("groups"));
      if (response) {
        setGroups(response.data as GroupResponseData[]);
      }
    } catch (error) {
      // Error fetching groups
    }
  }, [repo, addRequest]);

  const fetch = async (id: number, url: string = "documents") => {
    try {
      const response = await addRequest(() => Repo.show(url, id));
      return response.data;
    } catch (error) {
      // Error fetching resource
    }
  };

  const fetchCommitments = async (fundId: number) => {
    try {
      const response = await addRequest(() =>
        Repo.show("committment/funds", fundId)
      );
      return response.data;
    } catch (error) {
      // Error fetching commitments
    }
  };

  useEffect(() => {
    if (repo && !hasFetched) {
      resourceDependencies();
      getGroups();
      setHasFetched(true);
    }
  }, [repo, resourceDependencies, getGroups, hasFetched]);

  return { dependencies, fetch, fetchCommitments, groups };
};

export default useRepo;
