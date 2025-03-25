import React, { useEffect } from "react";
import { ActionComponentProps } from "../../modals/DocumentUpdateModal";
import { DocumentTrailResponseData } from "app/Repositories/DocumentTrail/data";
import DocumentTrailRepository from "app/Repositories/DocumentTrail/DocumentTrailRepository";
import { useStateContext } from "app/Context/ContentContext";
import { useAuth } from "app/Context/AuthContext";
import Textarea from "resources/views/components/forms/Textarea";
import Button from "resources/views/components/forms/Button";

const DocumentHistoryActionComponent: React.FC<
  ActionComponentProps<DocumentTrailResponseData, DocumentTrailRepository>
> = ({
  service,
  action,
  getModalState,
  currentDraft,
  updateModalState,
  handleInputChange,
  handleFormSubmit,
}) => {
  const { isLoading } = useStateContext();
  const { staff } = useAuth();

  const state: DocumentTrailResponseData = getModalState(service);

  useEffect(() => {
    if (staff) {
      updateModalState(service, {
        ...state,
        document_id: currentDraft.document_id,
        document_draft_id: currentDraft.id,
        document_action_id: action.id,
        user_id: staff.id,
        document_trailable_id: currentDraft.document_draftable_id,
        document_trailable_type: currentDraft.document_draftable_type,
      });
    }
  }, [currentDraft, staff, action]);

  return (
    <form onSubmit={handleFormSubmit}>
      <div className="col-md-12 mb-3">
        <Textarea
          label="Reason"
          value={state.reason}
          onChange={handleInputChange}
          placeholder={`Enter Reason for performing the action "${action.name}"`}
          rows={4}
          name="reason"
        />
      </div>
      <div className="col-md-12 mt-4">
        <Button
          label={action.button_text}
          variant={action.variant}
          size="sm"
          type="submit"
          icon={action.icon}
          isDisabled={state.reason === "" || isLoading}
        />
      </div>
    </form>
  );
};

export default DocumentHistoryActionComponent;
