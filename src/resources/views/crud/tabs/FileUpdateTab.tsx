import { DocumentResponseData } from "app/Repositories/Document/data";
import DocumentRepository from "app/Repositories/Document/DocumentRepository";
import React from "react";
import { FileDocketStateProps } from "resources/views/pages/FileDocket";

const FileUpdateTab: React.FC<
  FileDocketStateProps<DocumentResponseData, DocumentRepository>
> = ({ drafts, currentTracker, group, stage, model, actions }) => {
  // console.log(drafts, actions, stage);

  return <div>FileUpdateTab</div>;
};

export default FileUpdateTab;
