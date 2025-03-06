import { useEffect, useMemo, useState } from "react";
import { WorkflowResponseData } from "app/Repositories/Workflow/data";
import {
  DocumentResponseData,
  UploadResponseData,
} from "app/Repositories/Document/data";
import { ProgressTrackerResponseData } from "app/Repositories/ProgressTracker/data";
import { DocumentDraftResponseData } from "app/Repositories/DocumentDraft/data";
import { DocumentActionResponseData } from "app/Repositories/DocumentAction/data";
import {
  WorkflowStageGroupProps,
  WorkflowStageResponseData,
} from "app/Repositories/WorkflowStage/data";
import { FileTemplateResponseData } from "app/Repositories/FileTemplate/data";
import { DocumentTypeResponseData } from "app/Repositories/DocumentType/data";
import ProgressTrackerRepository from "app/Repositories/ProgressTracker/ProgressTrackerRepository";

export type DocumentableData = {
  id: number;
  uploads: UploadResponseData[];
  [key: string]: unknown;
};

const useWorkflow = (document: DocumentResponseData | null) => {
  const trackerRepo = useMemo(() => new ProgressTrackerRepository(), []);

  const [workflow, setWorkflow] = useState<WorkflowResponseData | null>(null);
  const [currentTracker, setCurrentTracker] =
    useState<ProgressTrackerResponseData | null>(null);
  const [drafts, setDrafts] = useState<DocumentDraftResponseData[]>([]);
  const [actions, setActions] = useState<DocumentActionResponseData[]>([]);
  const [stage, setStage] = useState<WorkflowStageResponseData | null>(null);
  const [group, setGroup] = useState<WorkflowStageGroupProps | null>(null);
  const [template, setTemplate] = useState<FileTemplateResponseData | null>(
    null
  );
  const [docType, setDocType] = useState<DocumentTypeResponseData | null>(null);
  const [uploads, setUploads] = useState<UploadResponseData[]>([]);

  const metaData = useMemo(() => {
    return document?.documentable as DocumentableData;
  }, [document]);

  useEffect(() => {
    if (document) {
      const { workflow, drafts, document_type, uploads = [] } = document;
      let lastestDraft: DocumentDraftResponseData;
      if (drafts) {
        lastestDraft = drafts.reduce(
          (max, item) => (item.id > max.id ? item : max),
          drafts[0]
        );
      }

      setUploads(metaData.uploads ?? []);

      const tracker = workflow?.trackers.find(
        (tracker) => tracker.id === lastestDraft.progress_tracker_id
      );

      const sanitized = tracker ? trackerRepo.fromJson(tracker) : null;

      if (document_type) {
        setDocType(document_type);
        const { template } = document_type;

        setTemplate(template);
      }

      if (sanitized) {
        setStage(sanitized.stage);
        setGroup(sanitized.group ?? null);
        setCurrentTracker(sanitized ?? null);
        setActions(sanitized.loadedActions ?? []);
      }

      setDrafts(drafts);
      setWorkflow(workflow);
    }
  }, [document]);

  return {
    workflow,
    currentTracker,
    group,
    stage,
    drafts,
    actions,
    docType,
    template,
    uploads,
  };
};

export default useWorkflow;
