import {
  DocumentOwnerData,
  DocumentResponseData,
} from "app/Repositories/Document/data";
import { formatText, handleProgressFlow } from "app/Support/Helpers";
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
      <small
        className={`status-badge ${document?.action?.variant ?? "warning"}`}
      >
        {formatText(document?.action?.draft_status ?? "pending")}
      </small>

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
            Published: {moment(document.created_at).format("LL")}
          </small>
        </div>

        <div className="avatar-group">
          <img
            src="https://placehold.co/40x40"
            alt="User 1"
            className="custom__avatar"
          />
          <img
            src="https://placehold.co/40x40"
            alt="User 2"
            className="custom__avatar"
          />
          <img
            src="https://placehold.co/40x40"
            alt="User 3"
            className="custom__avatar"
          />
          <img
            src="https://placehold.co/40x40"
            alt="User 4"
            className="custom__avatar"
          />
          <span className="more-avatars">+3</span>
        </div>

        <Button
          label="Open File"
          icon="ri-file-paper-line"
          handleClick={() => openFolder(document)}
          variant="success"
          size="xs"
        />
      </div>

      {/* <div className="ncdmb_logo" /> */}
    </div>
  );
};

export default FolderComponent;
