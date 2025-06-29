import { BaseRepository } from "app/Repositories/BaseRepository";
import { GroupResponseData } from "app/Repositories/Group/data";
import { useEffect, useMemo, useState } from "react";

const useRepo = <D extends BaseRepository>(Repo: D) => {
  const repo = useMemo(() => Repo, [Repo]);
  const [dependencies, setDependencies] = useState<unknown>({});
  const [groups, setGroups] = useState<GroupResponseData[]>([]);

  const resourceDependencies = async () => {
    try {
      const response = await repo.dependencies();
      setDependencies(response);
    } catch (error) {
      console.log("Error fetching dependencies: ", error);
    }
  };

  const getGroups = async () => {
    try {
      const response = await repo.collection("groups");
      if (response) {
        setGroups(response.data as GroupResponseData[]);
      }
    } catch (error) {
      console.log("Error fetching groups");
    }
  };

  const fetch = async (id: number, url: string = "documents") => {
    try {
      const response = await Repo.show(url, id);
      return response.data;
      // console.log(response);
    } catch (error) {
      console.log("Error fetching resource ", error);
    }
  };

  const fetchCommitments = async (fundId: number) => {
    try {
      const response = await Repo.show("committment/funds", fundId);
      return response.data;
    } catch (error) {
      console.log("Error fetching committments ", error);
    }
  };

  useEffect(() => {
    if (repo) {
      resourceDependencies();
      getGroups();
    }
  }, [repo]);

  return { dependencies, fetch, fetchCommitments, groups };
};

export default useRepo;
