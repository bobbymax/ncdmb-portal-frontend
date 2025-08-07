import { DocumentResponseData } from "app/Repositories/Document/data";
import DocumentRepository from "app/Repositories/Document/DocumentRepository";
import { CardPageComponentProps } from "bootstrap";
import React, { useState } from "react";
import TextInput from "../components/forms/TextInput";
import folder from "../../assets/images/folder.png";
import moment from "moment";
import fileIcons from "app/Support/FileIcons";
import Button from "../components/forms/Button";

const Verifications: React.FC<
  CardPageComponentProps<DocumentResponseData, DocumentRepository>
> = ({ Repository, collection, onManageRawData, View }) => {
  const [searchValue, setSearchValue] = useState<string>("");

  return (
    <div className="row">
      <div className="col-md-12 mb-3">
        <TextInput
          //   label="Search Documents"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search all documents"
          size="xl"
        />
      </div>
      <div className="col-md-12 mb-3">
        <div className="row">
          {collection.map((document) => (
            <div key={document.id} className="col-md-4 mb-3">
              <div className="custom-card file__card">
                <div className="file__card__header flex align between mb-4">
                  <div className="identity flex align start gap-lg">
                    <div className="avatar"></div>
                    <div className="user_name">
                      <p>Ekaro Bobby</p>
                      <small>ICT Division</small>
                    </div>
                  </div>
                  <div className="category flex end">
                    <img src={fileIcons.claim} alt="Claim Icon" />
                  </div>
                </div>
                <div className="file__card__item mb-3">
                  <div className="right">
                    <small>{document.ref}</small>
                    <h2>{document.title}</h2>
                    <small className="bready">
                      File Created: {moment(document.created_at).format("LL")}
                    </small>
                  </div>
                  <div className="file__icon__desc">
                    <img
                      src={folder}
                      alt="folder icon"
                      style={{ width: "10%" }}
                    />
                    <div className="progress">
                      <div
                        className="progress-bar bg-success"
                        role="progressbar"
                        style={{
                          width: `${document.drafts.length ?? 0}%`,
                        }}
                      >
                        {`${document.drafts.length ?? 0}%`}
                      </div>
                    </div>
                  </div>
                  <Button
                    label="Open File"
                    icon="ri-folder-open-line"
                    handleClick={() => {}}
                    variant="info"
                    size="sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Verifications;
