import {
  ProcessedDataProps,
  ServerSideProcessedDataProps,
  useFileProcessor,
} from "app/Context/FileProcessorProvider";
import { BaseRepository, BaseResponse } from "app/Repositories/BaseRepository";
import { DocumentResponseData } from "app/Repositories/Document/data";
import { DocumentActionResponseData } from "app/Repositories/DocumentAction/data";
import Alert from "app/Support/Alert";
import { useCallback, useMemo, useState } from "react";

const useEditorResources = <D extends BaseRepository>(Repo: D) => {
  const { getState, processorUri } = useFileProcessor();
  const [resources, setResources] = useState<
    ProcessedDataProps<BaseResponse>[]
  >([]);
  const currentServerState = useMemo(
    () => getState("serverSideProcessedData"),
    [getState]
  );

  const transmit = useCallback(
    (
      action: DocumentActionResponseData,
      state: ServerSideProcessedDataProps<BaseResponse>,
      iterables: ProcessedDataProps<BaseResponse>[],
      callback?: (response: DocumentResponseData) => void
    ) => {
      const body: ServerSideProcessedDataProps<BaseResponse> = {
        ...state,
        document_action_id: action.id,
        resources: iterables,
      };

      Alert.flash("Confirm", "info", "This action cannot be reversed!!").then(
        async (result) => {
          if (result.isConfirmed) {
            try {
              const response = await Repo.store(processorUri, body);

              if (response) {
                if (callback) {
                  callback(response.data as DocumentResponseData);
                }

                return response.data;
              }
            } catch (error) {
              // Error fetching editor resources
            }
          }
        }
      );
    },
    [Repo, processorUri]
  );
  return { currentServerState, setResources, resources, transmit };
};

export default useEditorResources;
