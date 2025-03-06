import { BaseRepository, BaseResponse } from "app/Repositories/BaseRepository";
import { useEffect, useMemo, useState } from "react";

const useRepo = <D extends BaseRepository>(Repo: D) => {
  const repo = useMemo(() => Repo, [Repo]);
  const [dependencies, setDependencies] = useState<unknown>({});

  const resourceDependencies = async () => {
    try {
      const response = await repo.dependencies();
      setDependencies(response);
    } catch (error) {
      console.log("Error fetching dependencies: ", error);
    }
  };

  useEffect(() => {
    if (repo) {
      resourceDependencies();
    }
  }, [repo]);

  return { dependencies };
};

export default useRepo;
