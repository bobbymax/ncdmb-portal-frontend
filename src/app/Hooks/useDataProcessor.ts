import { useAuth } from "app/Context/AuthContext";
import {
  ServerSideProcessedDataProps,
  useFileProcessor,
} from "app/Context/FileProcessorProvider";
import { BaseResponse } from "app/Repositories/BaseRepository";
import { DocumentResponseData } from "app/Repositories/Document/data";
import { DocumentDraftResponseData } from "app/Repositories/DocumentDraft/data";
import { ProgressTrackerResponseData } from "app/Repositories/ProgressTracker/data";
import { repo } from "bootstrap/repositories";
import { useEffect, useMemo, useState } from "react";

const useDataProcessor = <T extends BaseResponse>(
  data: T,
  document_type: string,
  document_category: string,
  service: string,
  entity: string,
  mode: "store" | "update" | "destroy",
  status: "draft" | "posted" | "reversed",
  method: string,
  document: DocumentResponseData,
  currentDraft: DocumentDraftResponseData | null,
  tracker: ProgressTrackerResponseData,
  process_type: "staff" | "third-party" = "staff"
) => {
  const { updateServerProcessedData, processIncomingData } = useFileProcessor();
  const serviceRepo = useMemo(() => repo(service), [service]);
  const { staff } = useAuth();
  const [dataState, setDataState] = useState<T>({} as T);

  const updateDataState = (params: Partial<T>) => {
    setDataState((prev) => ({
      ...prev,
      ...params,
    }));
  };

  const handleDataStateChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setDataState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (!data || !document || !currentDraft || !tracker || !staff) return;

    const initialServiceSideState: Partial<ServerSideProcessedDataProps<T>> = {
      document_type,
      document_category,
      service,
      mode,
      status,
      method,
      document_resource_id: data.id,
      document_id: document.id,
      document_draft_id: currentDraft.id,
      workflow_id: document.workflow_id,
      trigger_workflow_id: tracker.internal_process_id,
      progress_tracker_id: tracker.id,
      type: process_type,
      budget_year: 2024,
      user_id: staff.id,
      department_id: staff.department_id,
    };

    updateServerProcessedData(initialServiceSideState);
  }, [
    data,
    document_type,
    document_category,
    service,
    mode,
    status,
    method,
    document,
    currentDraft,
    tracker,
    process_type,
    staff,
  ]);

  useEffect(() => {
    if (dataState) {
      const currentState: Partial<ServerSideProcessedDataProps<T>> = {
        state: dataState as unknown as { [key: string]: unknown },
      };
      updateServerProcessedData(currentState);
    }
  }, [dataState]);

  useEffect(() => {
    if (serviceRepo) {
      setDataState((prev) => ({
        ...prev,
        ...data,
      }));
    }
  }, [serviceRepo]);

  return {
    dataState,
    handleDataStateChange,
    updateDataState,
    processIncomingData,
  };
};

export default useDataProcessor;
