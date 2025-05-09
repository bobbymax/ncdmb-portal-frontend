import { useFileProcessor } from "app/Context/FileProcessorProvider";
import { DocketDataType } from "app/Hooks/useWorkflowEngine";
import { DocumentResponseData } from "app/Repositories/Document/data";
import DocumentRepository from "app/Repositories/Document/DocumentRepository";
import { DocumentActionResponseData } from "app/Repositories/DocumentAction/data";
import Alert from "app/Support/Alert";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import EditableDocumentTabComponent from "resources/views/components/tabs/EditableDocumentTabComponent";
import LinkedDocumentCard from "resources/views/components/tabs/LinkedDocumentCard";

const LinkedDocumentsTab: React.FC<
  DocketDataType<DocumentResponseData, DocumentRepository>
> = ({ Repo, document, availableActions, currentTracker }) => {
  const navigate = useNavigate();
  const {
    setFile,
    setAlterAction,
    setIsEditing,
    setReconcile,
    processorUri,
    resetEditableState,
  } = useFileProcessor();
  const [linkedDocuments, setLinkedDocuments] = useState<
    DocumentResponseData[]
  >([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const reconcile: DocumentActionResponseData | null = useMemo(() => {
    if (availableActions.length < 1) return null;

    return (
      availableActions.find(
        (action) =>
          action.is_payment === 1 &&
          action.has_update === 1 &&
          action.resource_type === "private"
      ) ?? null
    );
  }, [availableActions]);

  const handleLinkedDocument = useCallback(
    (doc: DocumentResponseData | null) => {
      if (!doc) {
        setFile(null);
        setIsEditing(false);
        setIsOpen(false);
        setReconcile(null);
        return;
      }

      setFile(doc);
      setIsOpen(true);
      setIsEditing(true);
      setReconcile(reconcile ?? null);
    },
    [setFile, setIsEditing]
  );

  const closeCover = useCallback(() => {
    setFile(null);
    setIsOpen(false);
  }, [setFile]);

  const noop = useCallback((fileId: number) => {
    Alert.flash("Confirm!", "warning", "You are about to leave this page").then(
      (result) => {
        if (result.isConfirmed) {
          resetEditableState();
          navigate(`/desk/folders/${fileId}/manage`);
        }
      }
    );
  }, []);

  useEffect(() => {
    if (document) {
      const getLinkedDocuments = async () => {
        try {
          const response = await Repo.collection(
            `linked/documents/${document.id}`
          );

          if (response.code === 200) {
            setLinkedDocuments(response.data as DocumentResponseData[]);
          }
        } catch (error) {
          console.error("Something went wrong ", error);
        }
      };

      getLinkedDocuments();

      return () => {};
    }
  }, [document]);

  useEffect(() => {
    if (availableActions.length > 0) {
      const but =
        availableActions.find(
          (action) =>
            action.resource_type === "computed" &&
            action.category === "resource"
        ) ?? null;

      setAlterAction(but);
    }
  }, [availableActions]);

  const linkedDocumentItems = useMemo(() => {
    return linkedDocuments.length > 0 ? (
      linkedDocuments.map((doc, i) => (
        <div className="col-md-6" key={doc.id ?? i}>
          <LinkedDocumentCard
            permission={currentTracker?.permission as "r" | "rw" | "rwx"}
            document={doc}
            view={noop}
            makeChanges={handleLinkedDocument}
          />
        </div>
      ))
    ) : (
      <div className="col-md-12">
        <p>Nothing dey here!!</p>
      </div>
    );
  }, [linkedDocuments, handleLinkedDocument]);

  return (
    <>
      {isOpen ? (
        <div className="single__page">
          <div className="row">
            <div className="col-md-12">
              <EditableDocumentTabComponent
                availableActions={availableActions}
                closeCover={closeCover}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="document__lists">
          <div className="row">{linkedDocumentItems}</div>
        </div>
      )}
    </>
  );
};

export default LinkedDocumentsTab;
