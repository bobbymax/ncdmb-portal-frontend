import { usePaperBoard } from "app/Context/PaperBoardContext";
import { BaseRepository } from "@/app/Repositories/BaseRepository";
import { DocumentCategoryResponseData } from "@/app/Repositories/DocumentCategory/data";
import React from "react";

interface ProjectResourceCardProps {
  category: DocumentCategoryResponseData;
  repository: BaseRepository;
}

const ProjectResourceCard: React.FC<ProjectResourceCardProps> = ({
  category,
  repository,
}) => {
  const { state, actions } = usePaperBoard();

  console.log(state);

  return <div>ProjectResourceCard</div>;
};

export default ProjectResourceCard;
