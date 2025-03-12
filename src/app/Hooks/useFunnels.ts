import { BaseRepository } from "app/Repositories/BaseRepository";
import { ServerDataRequestProps } from "./useWorkflowEngine";

const useFunnels = () => {
  const strip_snake = (element: string): string => element.replace(/_/g, "");

  const stream = async <T extends BaseRepository>(
    Repo: T,
    draftState: ServerDataRequestProps
  ) => {
    // Check if the service is empty
    if (!Repo || draftState.service === "") {
      return;
    }

    const service = strip_snake(draftState.service);

    try {
      return Repo.update("service-workers", service, draftState);
    } catch (error) {
      console.log("Error processing file state: ", error);
      return;
    }
  };

  return { stream };
};

export default useFunnels;
