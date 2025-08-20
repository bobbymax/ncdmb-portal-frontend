import PaperBoardErrorBoundary from "app/Boundaries/PaperBoardErrorBoundary";
import { PaperBoardProvider } from "app/Context/PaperBoardProvider";
import { BaseRepository } from "@/app/Repositories/BaseRepository";
import { PageProps } from "@/bootstrap";
import DocumentTemplateContent from "./DocumentTemplateContent";
import { useResourceActions } from "app/Hooks/useResourceActions";
import { useEffect, useState } from "react";
import { DocumentCategoryResponseData } from "@/app/Repositories/DocumentCategory/data";

const BuildTemplate = ({
  Repository,
  view,
  BuilderComponent,
}: PageProps<BaseRepository>) => {
  const { raw, redirectTo, back } = useResourceActions(Repository, view, {
    shouldFetch: false,
    hasParam: true,
  });

  return (
    <PaperBoardErrorBoundary>
      <PaperBoardProvider>
        <DocumentTemplateContent
          Repository={Repository}
          ResourceGeneratorComponent={BuilderComponent}
          category={raw as DocumentCategoryResponseData}
          editedContents={
            (raw as DocumentCategoryResponseData).template?.body ?? []
          }
          mode="update"
          context="builder"
        />
      </PaperBoardProvider>
    </PaperBoardErrorBoundary>
  );
};

export default BuildTemplate;
