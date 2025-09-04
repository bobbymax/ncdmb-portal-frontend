import useDocumentGenerator from "app/Hooks/useDocumentGenerator";
import { BaseRepository } from "@/app/Repositories/BaseRepository";
import { PageProps } from "@/bootstrap";
import { useParams } from "react-router-dom";
import PaperBoardErrorBoundary from "app/Boundaries/PaperBoardErrorBoundary";
import { PaperBoardProvider } from "app/Context/PaperBoardProvider";
import DocumentTemplateContent from "./DocumentTemplateContent";
import { usePaperBoard } from "app/Context/PaperBoardContext";
import { useEffect } from "react";

const GenerateDocument = ({
  Repository,
  view,
  BuilderComponent,
}: PageProps<BaseRepository>) => {
  const params = useParams();
  const { category, editedContents, existingDocument } =
    useDocumentGenerator(params);

  return (
    <PaperBoardErrorBoundary>
      <PaperBoardProvider>
        <DocumentTemplateContent
          Repository={Repository}
          ResourceGeneratorComponent={BuilderComponent}
          category={category}
          editedContents={editedContents}
          mode={existingDocument ? "update" : "store"}
          existingDocument={existingDocument}
        />
      </PaperBoardProvider>
    </PaperBoardErrorBoundary>
  );
};

export default GenerateDocument;
