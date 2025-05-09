import { DocumentResponseData } from "app/Repositories/Document/data";
import { extractModelName, toTitleCase } from "bootstrap/repositories";
import moment from "moment";
import Button from "../forms/Button";

const LinkedDocumentCard = ({
  document,
  view,
  makeChanges,
  permission,
}: {
  permission: "r" | "rw" | "rwx";
  document: DocumentResponseData;
  view: (fileId: number) => void;
  makeChanges: (data: DocumentResponseData) => void;
}) => {
  return (
    <div className="linked__document__card mb-4">
      <h4>{document.title}</h4>
      <small>{document.ref}</small>
      <span>
        Document Type:{" "}
        {toTitleCase(extractModelName(document?.documentable_type))}
      </span>
      <span>Prepared By: {document.owner?.name}</span>
      <span>Department: {document?.owner?.department}</span>
      <span>Supporting Documents Upload: {document?.uploads?.length}</span>
      <span style={{ marginBottom: 30 }}>
        Published On: {moment(document.created_at).format("LL")}
      </span>

      <div className="flex align gap-md">
        {permission !== "r" && (
          <Button
            label="Make Changes"
            variant="danger"
            handleClick={() => makeChanges(document)}
            icon="ri-file-edit-line"
            size="sm"
          />
        )}
        <Button
          label="Open Document"
          variant="warning"
          handleClick={() => view(document.id)}
          icon="ri-folder-open-line"
          size="sm"
        />
      </div>
    </div>
  );
};

export default LinkedDocumentCard;
