import Button from "../forms/Button";
import {
  ServerSideProcessedDataProps,
  useFileProcessor,
} from "app/Context/FileProcessorProvider";
import { Suspense, useEffect, useMemo } from "react";
import moment from "moment";
import { BaseResponse } from "app/Repositories/BaseRepository";
import { DocumentActionResponseData } from "app/Repositories/DocumentAction/data";

const EditableDocumentTabComponent = ({
  closeCover,
  availableActions,
}: {
  closeCover: () => void;
  availableActions: DocumentActionResponseData[];
}) => {
  const {
    editableComponent,
    file,
    service,
    lastDraft,
    alterAction,
    updateServerProcessedData,
    processedData,
  } = useFileProcessor();

  useEffect(() => {
    if (file && service !== "" && lastDraft && alterAction) {
      // code here
      const body: Partial<ServerSideProcessedDataProps<BaseResponse>> = {
        document_id: file.id,
        document_draft_id: lastDraft.id,
        workflow_id: file.workflow_id,
        progress_tracker_id: file.progress_tracker_id,
        document_action_id: alterAction.id,
        service,
        mode: "update" as "store" | "update",
        method: "consolidate",
      };

      updateServerProcessedData(body);
    }
  }, [file, service, lastDraft, alterAction]);

  return (
    <>
      <div className="page__header__top flex align between mb-4">
        <div className="title__wrapper">
          <small>{file?.ref}</small>
          <h3>{file?.title}</h3>
          <small>Created at: {moment(file?.created_at).format("LL")}</small>
        </div>
        <Button
          label="Close"
          icon="ri-folder-close-line"
          handleClick={() => closeCover()}
          size="sm"
          variant="danger"
          isDisabled={processedData.length > 0}
        />
      </div>

      <div className="editable__content__area">
        <Suspense fallback={<p>Loading...</p>}>{editableComponent}</Suspense>
      </div>
    </>
  );
};

export default EditableDocumentTabComponent;
