import { useCallback } from "react";
import { usePaperBoard } from "app/Context/PaperBoardContext";
import { DocumentActivity } from "app/Context/PaperBoardContext";

// Activity type constants
export const ACTIVITY_TYPES = {
  DOCUMENT_TOGGLE: "document_toggle",
  WORKFLOW_ACTION: "workflow_action",
  CONTENT_ADD: "content_add",
  CONTENT_REMOVE: "content_remove",
  CONTENT_EDIT: "content_edit",
  CONTENT_REORDER: "content_reorder",
  SIGNATURE_START: "signature_start",
  SIGNATURE_SAVE: "signature_save",
  SIGNATURE_CANCEL: "signature_cancel",
  TAB_SWITCH: "tab_switch",
  RESOURCE_LINK: "resource_link",
  DOCUMENT_GENERATE: "document_generate",
} as const;

// Message templates
const generateMessage = (
  action: string,
  user: string,
  context?: any,
  trackerName?: string
): string => {
  const trackerContext = trackerName ? ` in ${trackerName}` : "";

  const templates: Record<string, string> = {
    document_toggle: `${user} ${
      context?.isEditor ? "enabled" : "disabled"
    } document editing mode${trackerContext}`,
    workflow_action: `${user} ${context?.action_status} the document workflow${trackerContext}`,
    content_add: `${user} added a ${
      context?.blockType || "content"
    } block${trackerContext}`,
    content_remove: `${user} removed a ${
      context?.blockType || "content"
    } block${trackerContext}`,
    content_reorder: `${user} reordered document content${trackerContext}`,
    signature_start: `${user} started signing the document${trackerContext}`,
    signature_save: `${user} saved their signature${trackerContext}`,
    signature_cancel: `${user} cancelled signature${trackerContext}`,
    tab_switch: `${user} switched to ${
      context?.tabName || "a"
    } tab${trackerContext}`,
    resource_link: `${user} ${
      context?.action || "modified"
    } a resource link${trackerContext}`,
    document_generate: `${user} generated the document${trackerContext}`,
  };

  return templates[action] || `${user} performed ${action}${trackerContext}`;
};

export interface UseActivityLoggerReturn {
  logActivity: (action: string, message?: string, metadata?: any) => void;
  logDocumentToggle: (isEditor: boolean) => void;
  logWorkflowAction: (actionStatus: string) => void;
  logContentAction: (
    action: string,
    blockType?: string,
    blockId?: string
  ) => void;
  logSignatureAction: (action: string) => void;
  logTabSwitch: (tabName: string) => void;
  logResourceLink: (action: string, blockId?: string) => void;
  logDocumentGenerate: () => void;
}

export const useActivityLogger = (): UseActivityLoggerReturn => {
  const { state, actions } = usePaperBoard();

  const logActivity = useCallback(
    (action: string, message?: string, metadata?: any) => {
      const user = state.loggedInUser?.name || "Unknown User";

      // Find current tracker
      const currentTracker = state.trackers.find(
        (tracker) => tracker.identifier === state.currentPointer
      );

      const finalMessage =
        message ||
        generateMessage(action, user, metadata, currentTracker?.signatory_type);

      const activity: DocumentActivity = {
        id: crypto.randomUUID(),
        user_id: state.loggedInUser?.id || 0,
        user_name: user,
        action_performed: action,
        message: finalMessage,
        timestamp: new Date().toISOString(),
        metadata: {
          document_id: state.existingDocument?.id,
          tracker_id: state.currentPointer,
          tracker_name: currentTracker?.signatory_type || "Unknown Stage",
          tracker_flow_type: currentTracker?.flow_type || "unknown",
          ...metadata,
        },
      };

      actions.addDocumentActivity(activity);

      // TODO: Send to server (future implementation)
      // await Repository.store("activities", activity);
    },
    [
      state.loggedInUser,
      state.existingDocument,
      state.trackers,
      state.currentPointer,
      actions,
    ]
  );

  // Specific logging methods for common actions
  const logDocumentToggle = useCallback(
    (isEditor: boolean) => {
      logActivity(ACTIVITY_TYPES.DOCUMENT_TOGGLE, undefined, { isEditor });
    },
    [logActivity]
  );

  const logWorkflowAction = useCallback(
    (actionStatus: string) => {
      logActivity(ACTIVITY_TYPES.WORKFLOW_ACTION, undefined, {
        action_status: actionStatus,
      });
    },
    [logActivity]
  );

  const logContentAction = useCallback(
    (action: string, blockType?: string, blockId?: string) => {
      logActivity(action, undefined, { blockType, content_block_id: blockId });
    },
    [logActivity]
  );

  const logSignatureAction = useCallback(
    (action: string) => {
      logActivity(action);
    },
    [logActivity]
  );

  const logTabSwitch = useCallback(
    (tabName: string) => {
      logActivity(ACTIVITY_TYPES.TAB_SWITCH, undefined, { tabName });
    },
    [logActivity]
  );

  const logResourceLink = useCallback(
    (action: string, blockId?: string) => {
      logActivity(ACTIVITY_TYPES.RESOURCE_LINK, undefined, {
        action,
        content_block_id: blockId,
      });
    },
    [logActivity]
  );

  const logDocumentGenerate = useCallback(() => {
    logActivity(ACTIVITY_TYPES.DOCUMENT_GENERATE);
  }, [logActivity]);

  return {
    logActivity,
    logDocumentToggle,
    logWorkflowAction,
    logContentAction,
    logSignatureAction,
    logTabSwitch,
    logResourceLink,
    logDocumentGenerate,
  };
};
