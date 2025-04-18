import React, { useEffect } from "react";
import { ActionComponentProps } from "../../modals/DocumentUpdateModal";
import { DocumentUpdateResponseData } from "app/Repositories/DocumentUpdate/data";
import Textarea from "resources/views/components/forms/Textarea";
import Button from "resources/views/components/forms/Button";
import DocumentUpdateRepository from "app/Repositories/DocumentUpdate/DocumentUpdateRepository";

const MakeChangesActionComponent: React.FC<
  ActionComponentProps<DocumentUpdateResponseData, DocumentUpdateRepository>
> = ({
  identifier,
  data,
  action,
  currentDraft,
  getModalState,
  updateModalState,
  handleInputChange,
  handleFormSubmit,
  isLoading,
}) => {
  const state: DocumentUpdateResponseData = getModalState(identifier);

  useEffect(() => {
    if (data) {
      updateModalState(identifier, {
        ...state,
        document_action_id: action.id,
        document_draft_id: currentDraft.id,
      });
    }
  }, [data]);

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
            label={action.name}
            icon={action.icon}
            variant={action.variant}
            size="sm"
            type="submit"
            isDisabled={state.comment === "" || isLoading}
          />
        </div>
      </div>
    </form>
  );
};

export default MakeChangesActionComponent;
