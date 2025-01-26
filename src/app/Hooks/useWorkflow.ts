import { useEffect, useMemo, useState } from "react";
import WorkflowRepository from "app/Repositories/Workflow/WorkflowRepository";
import { WorkflowResponseData } from "app/Repositories/Workflow/data";
import { DocumentResponseData } from "app/Repositories/Document/data";
import { ProgressTrackerResponseData } from "app/Repositories/ProgressTracker/data";
import { DocumentDraftResponseData } from "app/Repositories/DocumentDraft/data";

const useWorkflow = (document: DocumentResponseData | null) => {
  const workflowRepo = useMemo(() => new WorkflowRepository(), []);

  const [workFlows, setWorkflows] = useState<WorkflowResponseData[]>([]);
  const [workflow, setWorkflow] = useState<WorkflowResponseData | null>(null);
  const [currentStage, setCurrentStage] =
    useState<ProgressTrackerResponseData | null>(null);

  const getCurrentStage = (
    workflow: WorkflowResponseData | null,
    drafts: DocumentDraftResponseData[]
  ) => {
    if (!workflow || drafts.length < 1) {
      return null;
    }

    const progressTrackers = workflow.trackers ?? [];

    if (progressTrackers.length < 1) {
      return null;
    }

    const lastDraft = drafts[drafts.length - 1];

    const currentStage = progressTrackers.find(
      (tracker) => lastDraft.progress_tracker_id === tracker.id
    );

    setCurrentStage(currentStage ?? null);
  };

  useEffect(() => {
    const getWorkflows = async () => {
      const response = await workflowRepo.collection("workflows");
      setWorkflows(response.data as WorkflowResponseData[]);
    };
    getWorkflows();
  }, [workflowRepo]);

  useEffect(() => {
    if (document && workFlows.length > 0) {
      const drafts = document.drafts;
      const documentWorkflow =
        workFlows.find((workflow) => document.workflow_id === workflow.id) ??
        null;

      setWorkflow(documentWorkflow);
      getCurrentStage(documentWorkflow, drafts);
    }
  }, [document, workFlows]);

  return { workflow, currentStage };
};

export default useWorkflow;
