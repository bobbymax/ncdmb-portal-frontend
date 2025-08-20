import { ContentAreaProps } from "app/Hooks/useBuilder";
import { BaseRepository } from "@/app/Repositories/BaseRepository";
import { DocumentCategoryResponseData } from "@/app/Repositories/DocumentCategory/data";
import React from "react";
import { ContextType, usePaperBoard } from "app/Context/PaperBoardContext";
import { useAuth } from "app/Context/AuthContext";

interface DocumentTemplateContentProps {
  Repository: BaseRepository;
  ResourceGeneratorComponent: React.ComponentType<any>;
  category: DocumentCategoryResponseData | null;
  editedContents: ContentAreaProps[];
  mode: "store" | "update";
  context: ContextType;
}

const DocumentTemplateContent = ({
  Repository,
  ResourceGeneratorComponent,
  category,
  editedContents,
  mode,
  context,
}: DocumentTemplateContentProps) => {
  const { state, actions } = usePaperBoard();
  const { staff } = useAuth();

  console.log(state);

  return (
    <div className="document__template__content">
      <div className="document__template__content__header">
        <h1>Document Template Content</h1>
      </div>
    </div>
  );
};

export default DocumentTemplateContent;
