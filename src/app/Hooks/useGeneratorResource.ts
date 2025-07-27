import { useEffect, useMemo, useState } from "react";
import { BaseRepository, BaseResponse } from "../Repositories/BaseRepository";
import { repo } from "bootstrap/repositories";
import { DocumentResponseData } from "../Repositories/Document/data";

const useGeneratorResource = <D extends BaseRepository, T extends BaseResponse>(
  Repo: D,
  service: string
) => {
  const documentRepo = useMemo(() => repo("document"), []);
  const [collection, setCollection] = useState<T[]>([]);
  const [resource, setResource] = useState<T | null>(null);
  const [state, setState] = useState<DocumentResponseData>(
    () => documentRepo.getState() as DocumentResponseData
  );

  useEffect(() => {
    if (service && service !== "" && Repo) {
      const getServiceCollection = async () => {
        const response = await Repo.collection(
          `resource/${service}/collection`
        );

        if (response.code === 200) {
          setCollection(response.data as T[]);
        }
      };

      getServiceCollection();
    }
  }, [service, Repo]);
  return { collection, state, setState, resource, setResource };
};

export default useGeneratorResource;
