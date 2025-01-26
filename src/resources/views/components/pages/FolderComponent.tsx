import {
  DocumentOwnerData,
  DocumentResponseData,
} from "app/Repositories/Document/data";
import { handleProgressFlow } from "app/Support/Helpers";
import fileIcons from "app/Support/FileIcons";
import folder from "../../../assets/images/folder.png";
import Button from "../forms/Button";
import moment from "moment";

interface FileCardProps {
  owner: DocumentOwnerData | null;
  document: DocumentResponseData;
  openFolder: (document: DocumentResponseData) => void;
}

const FolderComponent = ({ owner, document, openFolder }: FileCardProps) => {
  return (
    <div className="custom-card file__card">
      <div className="file__card__header flex align between mb-4">
        <div className="identity flex align start gap-lg">
          <div className="avatar"></div>
          <div className="user_name">
            <p>{owner?.name}</p>
            <small>{document?.owner?.department}</small>
          </div>
        </div>
        <div className="category flex end">
          <img src={fileIcons[document.document_template]} alt="Claim Icon" />
        </div>
      </div>
      <div className="file__card__item mb-3">
        <div className="right">
          <small>{document.ref}</small>
          <h2>{document.title}</h2>
          <small className="bready">
            Folder Created: {moment(document.created_at).format("LL")}
          </small>
        </div>
        <div className="file__icon__desc">
          <img src={folder} alt="folder icon" style={{ width: "10%" }} />
          <div className="progress">
            <div
              className="progress-bar bg-success"
              role="progressbar"
              style={{
                width: `${handleProgressFlow(
                  document.drafts.length,
                  document.workflow?.trackers ?? []
                )}%`,
              }}
            >
              {`${handleProgressFlow(
                document.drafts.length,
                document.workflow?.trackers ?? []
              )}%`}
            </div>
          </div>
        </div>
        <Button
          label="Open File"
          icon="ri-folder-open-line"
          handleClick={() => openFolder(document)}
          variant="dark"
          size="sm"
        />
      </div>
    </div>
  );
};

export default FolderComponent;
