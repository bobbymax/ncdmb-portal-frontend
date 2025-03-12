import React, { useMemo } from "react";
import { DraftPageProps } from "../../tabs/FilePagesTab";
import { ExpenditureResponseData } from "app/Repositories/Expenditure/data";
import ExpenditureRepository from "app/Repositories/Expenditure/ExpenditureRepository";
import moment from "moment";
import { dates } from "app/Support/Helpers";

const ExpenditureCardTemplate: React.FC<
  DraftPageProps<ExpenditureResponseData, ExpenditureRepository>
> = ({ draftId, drafts, currentDraft }) => {
  const expenditure = useMemo(() => {
    if (
      currentDraft?.draftable &&
      isExpenditureResponseData(currentDraft.draftable)
    ) {
      return currentDraft.draftable;
    }
    return null;
  }, [currentDraft]);

  // Type Guard Function
  function isExpenditureResponseData(
    data: any
  ): data is ExpenditureResponseData {
    return (
      typeof data === "object" &&
      data !== null &&
      "user_id" in data &&
      "department_id" in data &&
      "fund_id" in data &&
      "document_draft_id" in data
    );
  }

  return (
    <div className="row">
      <div className="col-md-12">
        <div className="expense__slip flex align">
          <div className="card__slips posted__date flex column center">
            <small>Deducted On:</small>
            <h1>{dates(expenditure?.created_at).day}</h1>
            <span>{`${dates(expenditure?.created_at).month}, ${
              dates(expenditure?.created_at)?.year
            }`}</span>
          </div>
          <div className="card__slips expense__details">
            <small className="clip dark">{expenditure?.type}</small>
            <h2>{expenditure?.purpose}</h2>
            <small></small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenditureCardTemplate;
