import { useEffect, useState } from "react";
import useDocumentGenerator from "app/Hooks/useDocumentGenerator";
import { BaseRepository } from "@/app/Repositories/BaseRepository";
import { PageProps } from "@/bootstrap";
import { useParams } from "react-router-dom";
import PaperBoardErrorBoundary from "app/Boundaries/PaperBoardErrorBoundary";
import { PaperBoardProvider } from "app/Context/PaperBoardProvider";
import DocumentTemplateContent from "./DocumentTemplateContent";

const GenerateDocument = ({
  Repository,
  view,
  BuilderComponent,
}: PageProps<BaseRepository>) => {
  const params = useParams();
  const { category, editedContents, existingDocument, isBuilding } =
    useDocumentGenerator(params);

  // Prevent mode switching until data is fully loaded to avoid re-initialization
  const [stableMode, setStableMode] = useState<"store" | "update">("store");

  useEffect(() => {
    console.log("Mode switch check:", {
      isBuilding,
      existingDocument: !!existingDocument,
      stableMode,
    });
    if (existingDocument) {
      // Switch to update mode as soon as document exists, regardless of isBuilding
      setStableMode("update");
    }
  }, [isBuilding, existingDocument]);

  // Removed loading state check to prevent infinite loading on new document creation
  // The component will render normally while building

  return (
    <PaperBoardErrorBoundary>
      <PaperBoardProvider>
        <DocumentTemplateContent
          Repository={Repository}
          ResourceGeneratorComponent={BuilderComponent}
          category={category}
          editedContents={editedContents}
          mode={stableMode}
          existingDocument={existingDocument}
        />
      </PaperBoardProvider>
    </PaperBoardErrorBoundary>
  );
};

export default GenerateDocument;
