import { DocumentDraftResponseData } from "app/Repositories/DocumentDraft/data";
import { useEffect, useMemo, useState } from "react";
import { DocumentNoteComponentProps } from "resources/views/crud/templates/drafts/DispatchNoteComponent";
import { JsonResponse } from "app/Repositories/BaseRepository";

export type DraftCardProps<T = JsonResponse> = {
  resource_id: number;
  user_id: number;
  draftable_id: number;
  message: string;
  componentState?: T;
  [key: string]: unknown;
};

export const useDraft = <T extends DocumentNoteComponentProps>(
  data: T,
  draftId: number,
  drafts: DocumentDraftResponseData[] | undefined
) => {
  const document = useMemo(() => data, [data]);

  const currentDraft = useMemo(() => {
    if (draftId < 1 || !Array.isArray(drafts)) return null;
    return drafts.find((draft) => draft.id === draftId);
  }, [drafts, draftId]);

  const lastDraft = useMemo(() => {
    if (draftId < 1 || !Array.isArray(drafts)) return null;
    return drafts?.reduce((max, draft) => (draft.id > max.id ? draft : max));
  }, [drafts, draftId]);

  const service = useMemo(() => {
    if (!currentDraft?.document_draftable_type) return "";
    return (
      currentDraft.document_draftable_type.split("\\").pop()?.toLowerCase() ||
      ""
    );
  }, [currentDraft]);

  const [draftState, setDraftState] = useState<DraftCardProps>({
    resource_id: document.id,
    user_id: document.user_id,
    draftable_id: document.id,
    message: "",
  });

  return {
    document,
    currentDraft,
    lastDraft,
    draftState,
    setDraftState,
    service,
  };
};
