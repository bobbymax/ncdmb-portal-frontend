import { DocumentResponseData } from "app/Repositories/Document/data";
import DocumentRepository from "app/Repositories/Document/DocumentRepository";
import { CardPageComponentProps } from "bootstrap";
import React, { useState } from "react";
import TextInput from "../components/forms/TextInput";
import FolderComponent from "../components/pages/FolderComponent";

const Folders: React.FC<
  CardPageComponentProps<DocumentResponseData, DocumentRepository>
> = ({ Repository, collection, onManageRawData, View }) => {
  const [searchValue, setSearchValue] = useState<string>("");

  const handleOpenFolder = (document: DocumentResponseData) => {
    onManageRawData(document, "manage");
  };

  return (
    <div className="row">
      <div className="col-md-12 mb-3">
        <TextInput
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search all documents"
          size="xl"
        />
      </div>
      <div className="col-md-12 mb-3">
        <div className="row">
          {collection.map((document) => (
            <div key={document.id} className="col-md-3 mb-3">
              <FolderComponent
                owner={document?.owner ?? null}
                document={document}
                openFolder={handleOpenFolder}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Folders;
