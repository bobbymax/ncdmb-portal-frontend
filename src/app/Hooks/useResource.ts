import { useStateContext } from "app/Context/ContentContext";
import { BaseRepository, BaseResponse } from "app/Repositories/BaseRepository";
import { Validator } from "app/Support/Validator";
import { FormEvent, useCallback, useEffect, useState } from "react";

type ProcessedDataProps<T extends BaseResponse> = {
  state: T | T[];
};

const useResource = <T extends BaseResponse, D extends BaseRepository>(
  repo: D
) => {
  const { setIsLoading } = useStateContext();
  const [dependencies, setDependencies] = useState<object>({});
  const [processingState, setPorcessingState] = useState<T>({} as T);
  const [processedData, setProcessedData] = useState<ProcessedDataProps<T>[]>(
    []
  );

  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      const { name, value } = e.target;

      setPorcessingState((prevState) => ({
        ...prevState,
        [name]: !isNaN(Number(value)) && value !== "" ? Number(value) : value,
      }));
    },
    []
  );

  const handleDataProcess = useCallback(
    (status: "cleared" | "altered" | "rejected") => {
      const { success, errors } = validate(processingState);

      if (success) {
        setProcessedData((prev) => ({
          ...prev,
          state: processingState,
        }));
      }
    },
    [processingState, repo, setIsLoading]
  );

  const validate = useCallback(
    (data: Record<string, any>): { success: boolean; errors: string[] } => {
      if (Object.keys(repo.rules).length > 0 && repo.fillables.length > 0) {
        const validator = new Validator(repo.fillables, repo.rules, data);
        validator.validate();

        if (validator.fails()) {
          return { success: false, errors: validator.getErrors() };
        }
      }

      return { success: true, errors: [] };
    },
    [repo.fillables, repo.rules]
  );

  useEffect(() => {
    const getDependencies = async () => {
      try {
        const response = await repo.dependencies();
        setDependencies(response);
      } catch (error) {
        console.error("Error fetching dependencies:", error);
      }
    };

    if (repo.associatedResources.length > 0) {
      getDependencies();
    }
  }, [repo]);

  return {
    dependencies,
    processingState,
    processedData,
    handleChange,
    handleDataProcess,
  };
};

export default useResource;
