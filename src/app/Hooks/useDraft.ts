import { DocumentDraftResponseData } from "app/Repositories/DocumentDraft/data";
import { useMemo } from "react";

export const useDraft = (
  draftId: number,
  drafts: DocumentDraftResponseData[] | undefined
) => {
  const draft = useMemo(() => {
    if (!drafts || draftId < 1) return {};

    // Sort drafts by ID in ascending order
    const sortedDrafts = [...drafts].sort((a, b) => a.id - b.id);

    // Find index of the current draft
    const currentIndex = sortedDrafts.findIndex(
      (draft) => draft.id === draftId
    );

    // Get current draft (if index is found)
    const current = currentIndex !== -1 ? sortedDrafts[currentIndex] : null;

    // Get the previous draft if it exists
    const previous = currentIndex > 0 ? sortedDrafts[currentIndex - 1] : null;

    // Get the last draft (highest ID)
    const last = sortedDrafts[sortedDrafts.length - 1];

    const service =
      (current &&
        current.document_draftable_type?.split("\\").pop()?.toLowerCase()) ||
      "";

    return { current, previous, last, service };
  }, [draftId, drafts]);

  const hasSignature = () => {
    const signature = draft.previous?.signature !== "";
    return signature ? draft.previous?.authorising_officer : null;
  };

  return {
    ...draft,
    hasSignature,
  };
};
