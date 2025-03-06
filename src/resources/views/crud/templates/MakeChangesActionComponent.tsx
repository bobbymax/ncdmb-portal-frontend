import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { ActionComponentProps } from "../modals/DocumentUpdateModal";
import { DocumentUpdateResponseData } from "app/Repositories/DocumentUpdate/data";
import Textarea from "resources/views/components/forms/Textarea";
import Button from "resources/views/components/forms/Button";
import { useFileDeskRoutePipelines } from "app/Hooks/useFileDeskRoutePipelines";
import { DocumentResponseData } from "app/Repositories/Document/data";

const MakeChangesActionComponent: React.FC<
  ActionComponentProps<DocumentUpdateResponseData>
> = ({ identifier, data, action, onSubmit, updateDocumentState, state }) => {
  const { handleFormSubmit, handleInputChange, isLoading } =
    useFileDeskRoutePipelines(
      identifier,
      data,
      action,
      updateDocumentState,
      state,
      onSubmit
    );

  return (
    <form onSubmit={handleFormSubmit}>
      <div className="row">
        <div className="col-md-12 mb-3">
          <Textarea
            label="Comment"
            value={state.comment}
            onChange={handleInputChange}
            rows={4}
            name="comment"
            placeholder="Enter Suggestions"
            isDisabled={isLoading}
          />
        </div>
        <div className="col-md-12">
          <Button
            label="Update Draft"
            icon="ri-message-line"
            variant="dark"
            size="md"
            type="submit"
            isDisabled={state.comment === "" || isLoading}
          />
        </div>
      </div>
    </form>
  );
};

export default MakeChangesActionComponent;
