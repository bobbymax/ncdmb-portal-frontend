import { BaseRepository, JsonResponse } from "app/Repositories/BaseRepository";
import { useCallback, useMemo } from "react";

const useResponse = <D extends BaseRepository>(Repository: D) => {
  const repo = useMemo(() => Repository, [Repository]);

  const populate = useCallback(
    (data: JsonResponse) => {
      return repo.fromJson(data);
    },
    [repo]
  );

  return { populate };
};

export default useResponse;
