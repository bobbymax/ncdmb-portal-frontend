import { useAuth } from "app/Context/AuthContext";
import {
  ServerSideProcessedDataProps,
  useFileProcessor,
} from "app/Context/FileProcessorProvider";
import { BaseResponse } from "app/Repositories/BaseRepository";
import { DocumentDraftResponseData } from "app/Repositories/DocumentDraft/data";
import { ProgressTrackerResponseData } from "app/Repositories/ProgressTracker/data";
import { useEffect, useMemo, useState } from "react";

export type ServerOptions = {
  type: "staff" | "third-party";
  method: string;
  mode: "store" | "update" | "destroy";
  service: string;
  period: string;
  file: string;
  state?: {
    [key: string]: unknown;
  };
  document_category?: string;
  document_type?: string;
  budget_year: number;
  workflow_id: number;
  trigger_workflow_id?: number;
  status?: string;
  entity_type?: string;
};

const useServerSideProcessedData = <T extends BaseResponse>(
  raw: T,
  currentDraft: DocumentDraftResponseData | null,
  options: ServerOptions,
  tracker: ProgressTrackerResponseData | null
) => {
  const { staff } = useAuth();
  const { updateServerProcessedData } = useFileProcessor();

  const [responseState, setResponseState] = useState<Record<string, unknown>>(
    {}
  );
  const [dataCollections, setDataCollections] = useState<unknown[]>([]);

  const serverState: Partial<ServerSideProcessedDataProps<T>> | undefined =
    useMemo(() => {
      if (!raw || !currentDraft || !tracker || !staff) return;

      const state: Partial<ServerSideProcessedDataProps<T>> = {
        document_id: currentDraft.document_id,
        document_draft_id: currentDraft.id,
        workflow_id: options.workflow_id,
        progress_tracker_id: tracker.id,
        service: options.service,
        mode: options.mode,
        method: options.method,
        user_id: staff.id,
        department_id: staff.department_id,
        budget_year: options.budget_year,
        document_category: options.document_category,
        document_type: options.document_type,
        document_resource_id: raw.id,
        trigger_workflow_id: options.trigger_workflow_id ?? 0,
        type: options.type,
        period: options.period,
        state: options.state,
        status: options.status,
      };

      return state;
    }, [raw, currentDraft, options, tracker, staff]);

  useEffect(() => {
    if (serverState) {
      updateServerProcessedData(serverState);
    }
  }, []);

  return { serverState, responseState, setResponseState, dataCollections };
};

export default useServerSideProcessedData;
