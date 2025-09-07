import { useState, useMemo, useCallback } from "react";
import { usePaperBoard } from "app/Context/PaperBoardContext";
import { CategoryProgressTrackerProps } from "app/Repositories/DocumentCategory/data";
import { DocumentCategoryResponseData } from "app/Repositories/DocumentCategory/data";
import { ContentBlock } from "@/resources/views/crud/DocumentTemplateBuilder";
import { toast } from "react-toastify";

export type ActionStatus =
  | "passed"
  | "stalled"
  | "processing"
  | "failed"
  | "reversed"
  | "complete"
  | "cancelled"
  | "appeal"
  | "escalate";

export interface WorkflowActionPayload {
  currentPointer: string;
  body: ContentBlock[];
  threads: any[];
  service: string;
  action_status: ActionStatus;
  action_id: number;
  user_id: number;
  document_id?: number;
  comments?: string;
  status: string;
  metadata?: any;
}

export interface UseCoreReturn {
  // Action methods
  pass: (
    actionId: number,
    comments?: string,
    draftStatus?: string
  ) => Promise<void>;
  stall: (
    actionId: number,
    comments?: string,
    draftStatus?: string
  ) => Promise<void>;
  process: (
    actionId: number,
    comments?: string,
    draftStatus?: string
  ) => Promise<void>;
  reverse: (
    actionId: number,
    comments?: string,
    draftStatus?: string
  ) => Promise<void>;
  complete: (
    actionId: number,
    comments?: string,
    draftStatus?: string
  ) => Promise<void>;
  cancel: (
    actionId: number,
    comments?: string,
    draftStatus?: string
  ) => Promise<void>;
  appeal: (
    actionId: number,
    comments?: string,
    draftStatus?: string
  ) => Promise<void>;
  escalate: (
    actionId: number,
    comments?: string,
    draftStatus?: string
  ) => Promise<void>;

  // Utility methods
  canPass: boolean;
  canStall: boolean;
  canProcess: boolean;
  canReverse: boolean;
  canComplete: boolean;
  canCancel: boolean;
  canAppeal: boolean;
  canEscalate: boolean;

  // State
  isLoading: boolean;
  error: string | null;
  currentTracker: CategoryProgressTrackerProps | null;
  nextTracker: CategoryProgressTrackerProps | null;
  previousTracker: CategoryProgressTrackerProps | null;
}

export const useCore = (
  category: DocumentCategoryResponseData | null
): UseCoreReturn => {
  const { state, actions } = usePaperBoard();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get current tracker from state
  const currentTracker: CategoryProgressTrackerProps | null = useMemo(() => {
    if (!state.currentPointer || !state.trackers) {
      return null;
    }
    return (
      state.trackers.find(
        (tracker) => tracker.identifier === state.currentPointer
      ) || null
    );
  }, [state.currentPointer, state.trackers]);

  // Get next tracker based on flow_type
  const nextTracker: CategoryProgressTrackerProps | null = useMemo(() => {
    if (!currentTracker || !state.trackers) {
      return null;
    }

    // Define the flow sequence
    const flowSequence = ["from", "through", "to"];
    const currentFlowIndex = flowSequence.indexOf(currentTracker.flow_type);

    if (
      currentFlowIndex === -1 ||
      currentFlowIndex === flowSequence.length - 1
    ) {
      // Current tracker is not in sequence or is the last one
      return null;
    }

    // Look for the next available tracker in the sequence
    for (let i = currentFlowIndex + 1; i < flowSequence.length; i++) {
      const nextFlowType = flowSequence[i];
      const foundTracker = state.trackers.find(
        (tracker) => tracker.flow_type === nextFlowType
      );

      if (foundTracker) {
        return foundTracker;
      }
    }

    // No next tracker found
    return null;
  }, [currentTracker, state.trackers]);

  // Get previous tracker based on flow_type
  const previousTracker: CategoryProgressTrackerProps | null = useMemo(() => {
    if (!currentTracker || !state.trackers) {
      return null;
    }

    // Define the flow sequence
    const flowSequence = ["from", "through", "to"];
    const currentFlowIndex = flowSequence.indexOf(currentTracker.flow_type);

    if (currentFlowIndex <= 0) {
      // Current tracker is not in sequence or is the first one
      return null;
    }

    // Look for the previous available tracker in the sequence
    for (let i = currentFlowIndex - 1; i >= 0; i--) {
      const previousFlowType = flowSequence[i];
      const foundTracker = state.trackers.find(
        (tracker) => tracker.flow_type === previousFlowType
      );

      if (foundTracker) {
        return foundTracker;
      }
    }

    // No previous tracker found
    return null;
  }, [currentTracker, state.trackers]);

  // console.log(state.trackers);

  // Validation methods
  const canPass = useMemo(() => {
    return !isLoading && !!nextTracker && !!currentTracker;
  }, [isLoading, nextTracker, currentTracker]);

  const canStall = useMemo(() => {
    return !isLoading && !!currentTracker;
  }, [isLoading, currentTracker]);

  const canProcess = useMemo(() => {
    return !isLoading && !!currentTracker;
  }, [isLoading, currentTracker]);

  const canReverse = useMemo(() => {
    return !isLoading && !!previousTracker && !!currentTracker;
  }, [isLoading, previousTracker, currentTracker]);

  const canComplete = useMemo(() => {
    return !isLoading && !!currentTracker;
  }, [isLoading, currentTracker]);

  const canCancel = useMemo(() => {
    return !isLoading && !!currentTracker;
  }, [isLoading, currentTracker]);

  const canAppeal = useMemo(() => {
    return !isLoading && !!currentTracker;
  }, [isLoading, currentTracker]);

  const canEscalate = useMemo(() => {
    return !isLoading && !!currentTracker;
  }, [isLoading, currentTracker]);

  // Generic action handler
  const executeAction = useCallback(
    async (
      actionStatus: ActionStatus,
      actionId: number,
      comments?: string,
      newPointer?: string,
      draftStatus?: string
    ) => {
      if (!currentTracker || !category?.service) {
        setError("Missing required data for action");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Prepare server data
        const serverData: WorkflowActionPayload = {
          currentPointer: newPointer || state.currentPointer || "",
          body: state.body,
          threads: state.threads || [],
          service: category.service,
          action_status: actionStatus,
          action_id: actionId,
          user_id: state.loggedInUser?.id || 0,
          document_id: state.existingDocument?.id,
          comments,
          status: draftStatus || "",
          metadata: {
            timestamp: new Date().toISOString(),
            user: {
              id: state.loggedInUser?.id,
              name: state.loggedInUser?.name,
              email: state.loggedInUser?.email,
            },
          },
        };

        // TODO: Replace with actual API call
        // Example: const response = await Repository.store("workflow/action", serverData);
        // if (response.code !== 200) {
        //   throw new Error(response.message || "Workflow action failed");
        // }

        // Simulate API call for now
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Simulate success response
        console.log("Workflow action executed:", serverData);

        // Update local state
        if (newPointer) {
          actions.setCurrentPointer(newPointer);
        }

        // Show success message
        toast.success(`Action ${actionStatus} completed successfully`);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);
        toast.error(`Failed to ${actionStatus}: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    },
    [currentTracker, category, state, actions]
  );

  // Action methods
  const pass = useCallback(
    async (actionId: number, comments?: string, draftStatus?: string) => {
      if (!nextTracker) {
        setError("No next tracker available");
        return;
      }
      await executeAction(
        "passed",
        actionId,
        comments,
        nextTracker.identifier,
        draftStatus
      );
    },
    [nextTracker, executeAction]
  );

  const stall = useCallback(
    async (actionId: number, comments?: string, draftStatus?: string) => {
      await executeAction(
        "stalled",
        actionId,
        comments,
        undefined,
        draftStatus
      );
    },
    [executeAction]
  );

  const process = useCallback(
    async (actionId: number, comments?: string, draftStatus?: string) => {
      await executeAction(
        "processing",
        actionId,
        comments,
        undefined,
        draftStatus
      );
    },
    [executeAction]
  );

  const reverse = useCallback(
    async (actionId: number, comments?: string, draftStatus?: string) => {
      if (!previousTracker) {
        setError("No previous tracker available");
        return;
      }
      await executeAction(
        "reversed",
        actionId,
        comments,
        previousTracker.identifier,
        draftStatus
      );
    },
    [previousTracker, executeAction]
  );

  const complete = useCallback(
    async (actionId: number, comments?: string, draftStatus?: string) => {
      // For complete, we might want to move to next tracker or mark as final
      const targetPointer = nextTracker
        ? nextTracker.identifier
        : state.currentPointer || "";
      await executeAction(
        "complete",
        actionId,
        comments,
        targetPointer,
        draftStatus
      );
    },
    [nextTracker, executeAction, state.currentPointer]
  );

  const cancel = useCallback(
    async (actionId: number, comments?: string, draftStatus?: string) => {
      await executeAction(
        "cancelled",
        actionId,
        comments,
        undefined,
        draftStatus
      );
    },
    [executeAction]
  );

  const appeal = useCallback(
    async (actionId: number, comments?: string, draftStatus?: string) => {
      await executeAction("appeal", actionId, comments, undefined, draftStatus);
    },
    [executeAction]
  );

  const escalate = useCallback(
    async (actionId: number, comments?: string, draftStatus?: string) => {
      await executeAction(
        "escalate",
        actionId,
        comments,
        undefined,
        draftStatus
      );
    },
    [executeAction]
  );

  return {
    // Action methods
    pass,
    stall,
    process,
    reverse,
    complete,
    cancel,
    appeal,
    escalate,

    // Utility methods
    canPass,
    canStall,
    canProcess,
    canReverse,
    canComplete,
    canCancel,
    canAppeal,
    canEscalate,

    // State
    isLoading,
    error,
    currentTracker,
    nextTracker,
    previousTracker,
  };
};
