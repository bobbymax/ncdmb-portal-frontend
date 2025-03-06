import React, { useEffect, useMemo } from "react";
import { DraftPageProps } from "../tabs/FilePagesTab";
import { useDraft } from "app/Hooks/useDraft";
import { TabModelProps } from "app/Hooks/useFilePages";

export type DocumentNoteComponentProps = {
  id: number;
  user_id: number;
  code?: string;
  [key: string]: any;
};

const DispatchNoteComponent: React.FC<DraftPageProps<TabModelProps>> = ({
  data,
  draftId,
  drafts,
  workflow,
  tracker,
  updateLocalState,
}) => {
  const { currentDraft } = useDraft(data, draftId, drafts, updateLocalState);

  const nextTracker = useMemo(() => {
    if (!tracker || !workflow) return null;

    return (
      workflow.trackers.find((track) => track.order === tracker.order + 1) ??
      null
    );
  }, [tracker, workflow]);

  return (
    <div className="notebook__container">
      <div className="notebook">
        <h2>Dispatch Document</h2>
        <p>
          The document with reference <b>{currentDraft?.ref}</b> has been
          prepared for transfer to <b>{nextTracker?.department?.name}</b>.
          Verify accuracy, completeness, and compliance before proceeding. If
          discrepancies exist, request corrections. Once confirmed, update the
          system and ensure secure transmission. Follow workflow guidelines for
          any clarifications.
        </p>
        <div className="status-bar">{currentDraft?.status}</div>
      </div>
    </div>
  );
};

export default DispatchNoteComponent;
