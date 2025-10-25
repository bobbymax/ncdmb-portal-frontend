import { DocumentCategoryResponseData } from "@/app/Repositories/DocumentCategory/data";
import React from "react";

interface EditorGeneratorTabProps {
  category: DocumentCategoryResponseData;
}

const EditorGeneratorTab: React.FC<EditorGeneratorTabProps> = ({
  category,
}) => {
  return <div>EditorGeneratorTab</div>;
};

export default EditorGeneratorTab;
