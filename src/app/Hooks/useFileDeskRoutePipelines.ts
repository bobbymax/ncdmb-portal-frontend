import { useAuth } from "app/Context/AuthContext";
import { useStateContext } from "app/Context/ContentContext";
import { DocumentResponseData } from "app/Repositories/Document/data";
import { DocumentActionResponseData } from "app/Repositories/DocumentAction/data";
import { DocumentUpdateResponseData } from "app/Repositories/DocumentUpdate/data";
import Alert from "app/Support/Alert";
import { repo } from "bootstrap/repositories";
import { FormEvent, lazy, useEffect, useMemo } from "react";
import { toast } from "react-toastify";

export const useFileDeskRoutePipelines = (
  identifier: string,
  document: DocumentResponseData,
  action: DocumentActionResponseData,
  updateDocumentState: (
    identifier: string,
    newState: Partial<DocumentUpdateResponseData>
  ) => void,
  state: DocumentUpdateResponseData,
  onSubmit: (response: unknown, service: string) => void
) => {
  const { staff } = useAuth();
  const { isLoading, setIsLoading } = useStateContext();
  const documentUpdateRepo = useMemo(() => repo("document_update"), []);

  // Compute the latest draft (Ensuring reduce() has an initial value)
  const lastDraft = useMemo(() => {
    if (!document?.drafts?.length) return null;
    return document.drafts.reduce((max, draft) =>
      draft.id > max.id ? draft : max
    );
  }, [document?.drafts]);

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // setIsLoading(true);

    Alert.flash("Update Document", "info", "Add update to this document").then(
      async (result) => {
        if (result.isConfirmed) {
          try {
            const response = await documentUpdateRepo.store(
              "documentUpdates",
              state
            );
            if (response.code === 201) {
              toast.success(response.message);
              onSubmit(
                {
                  document,
                  response: state,
                },
                "documentupdate"
              );
            }
          } catch (error) {
            toast.error("Error updating document");
            console.log(error);

            setIsLoading(false);
          } finally {
            setIsLoading(false);
          }
        }
      }
    );
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    updateDocumentState(identifier, { ...state, [name]: value });
  };

  useEffect(() => {
    if (staff && lastDraft) {
      updateDocumentState(identifier, {
        ...state,
        document_action_id: action.id,
        document_draft_id: lastDraft.id,
        user_id: staff?.id,
      });
    }
  }, [staff, lastDraft]);

  //   const commitDocumentUpdates = () => {};

  return { handleFormSubmit, handleInputChange, isLoading, lastDraft };
};
