import React, { useEffect, useState } from "react";
import { DraftPageProps } from "../../tabs/FilePagesTab";
import { JournalResponseData } from "app/Repositories/Journal/data";
import JournalRepository from "app/Repositories/Journal/JournalRepository";
import { DocumentResponseData } from "app/Repositories/Document/data";
import { repo } from "bootstrap/repositories";

const JournalTemplate: React.FC<
  DraftPageProps<JournalResponseData, JournalRepository>
> = ({
  resource: journal,
  currentDraft,
  group,
  actions,
  resolveAction,
  signatures,
  document,
}) => {
  //   console.log(journal);
  const journalRepo = repo("journal");
  const linkedUri = "linked/documents";
  const [documentHistory, setDocumentHistory] = useState<
    DocumentResponseData[]
  >([]);

  console.log(documentHistory);

  useEffect(() => {
    if (document && journalRepo) {
      const fetchLinkedDocuments = async () => {
        try {
          const response = await journalRepo.show(linkedUri, document.id);

          if (response) {
            setDocumentHistory(response.data as DocumentResponseData[]);
          }
        } catch (error) {
          console.log(error);
        }
      };

      fetchLinkedDocuments();
    }
  }, [document, journalRepo]);

  return <div>JournalTemplate</div>;
};

export default JournalTemplate;
