import { ContentAreaProps } from "app/Hooks/useBuilder";
import { BaseRepository } from "@/app/Repositories/BaseRepository";
import { DocumentCategoryResponseData } from "@/app/Repositories/DocumentCategory/data";
import React from "react";
import { usePaperBoard } from "app/Context/PaperBoardContext";
import { useAuth } from "app/Context/AuthContext";

interface DocumentTemplateContentProps {
  Repository: BaseRepository;
  ResourceGeneratorComponent: React.ComponentType<any>;
  category: DocumentCategoryResponseData | null;
  editedContents: ContentAreaProps[];
  mode: "store" | "update";
}

const DocumentTemplateContent = ({
  Repository,
  ResourceGeneratorComponent,
  category,
  editedContents,
  mode,
}: DocumentTemplateContentProps) => {
  const { state, actions } = usePaperBoard();
  const { staff } = useAuth();

  console.log(state);

  return <div>DocumentTemplateContent</div>;
};

export default DocumentTemplateContent;
