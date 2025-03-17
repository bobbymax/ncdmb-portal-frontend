import { useAuth } from "app/Context/AuthContext";
import { useCallback, useMemo } from "react";
import { DocumentResponseData } from "app/Repositories/Document/data";
import { DocumentDraftResponseData } from "app/Repositories/DocumentDraft/data";
import { DocumentActionResponseData } from "app/Repositories/DocumentAction/data";
import { ProgressTrackerResponseData } from "app/Repositories/ProgressTracker/data";
import { WorkflowResponseData } from "app/Repositories/Workflow/data";
import { BaseRepository } from "app/Repositories/BaseRepository";

export const useFilePages = <T extends BaseRepository>(
  model: DocumentResponseData,
  drafts: DocumentDraftResponseData[],
  actions: DocumentActionResponseData[],
  currentTracker: ProgressTrackerResponseData | undefined,
  workflow: WorkflowResponseData | undefined,
  Repo: T
) => {
  const { staff } = useAuth();

  const isAuthorisingStaff = useMemo(
    () =>
      (actionId: number): boolean => {
        if (
          !currentTracker ||
          !staff ||
          !currentTracker.stage?.append_signature ||
          actionId < 1 ||
          actions.length < 1
        ) {
          return false;
        }

        const action = actions.find((act) => act.id === actionId) ?? null;

        return checkActionPermissions(action);
      },
    [currentTracker, staff, actions]
  );

  const checkActionPermissions = useCallback(
    (action: DocumentActionResponseData | null): boolean => {
      if (!currentTracker || !action) return true;

      const { stage, group } = currentTracker;

      // Ensure staff belongs to the required group
      return group
        ? !staff?.groups.some((grp) => grp.label === group.label)
        : true;
    },
    [currentTracker, staff]
  );

  return true;
};
