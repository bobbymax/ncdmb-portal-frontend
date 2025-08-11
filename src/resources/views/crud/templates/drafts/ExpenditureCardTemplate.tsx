import React from "react";
import { DraftPageProps } from "../../tabs/FilePagesTab";
import { ExpenditureResponseData } from "app/Repositories/Expenditure/data";
import ExpenditureRepository from "app/Repositories/Expenditure/ExpenditureRepository";
import { dates, formatNumber } from "app/Support/Helpers";
import { useAuth } from "app/Context/AuthContext";
import { useDraft } from "app/Hooks/useDraft";

const ExpenditureCardTemplate: React.FC<
  DraftPageProps<ExpenditureResponseData, ExpenditureRepository>
> = ({ resource, data: expenditure, drafts, draftId }) => {
  const { staff } = useAuth();
  const { current, last } = useDraft(draftId, drafts);

  return (
    <div className="row">
      <div className="col-md-12">
        <div className="expense__slip flex align">
          <div className="card__slips posted__date flex column center align">
            <small>Deducted On:</small>
            <h1>{dates(expenditure?.created_at).day}</h1>
            <span>{`${dates(expenditure?.created_at).month}, ${
              dates(expenditure?.created_at)?.year
            }`}</span>
          </div>
          <div className="card__slips expense__details">
            <div className="credit__card__header">
              <div className="status__badge flex align end">
                {current?.status}
              </div>
              <div className="left__side">
                <div className="side__wrapper flex center column">
                  <div className="fling flex align gap-sm">
                    <i className="ri-secure-payment-fill" />
                    <small>{expenditure.type}</small>
                  </div>
                  <p>{expenditure.purpose}</p>
                  <div className="fund__details flex column mt-3">
                    <small className="small__title">Defrayed From:</small>
                    <small className="fund__name">
                      {expenditure.fund?.sub_budget_head} -{" "}
                      {expenditure.fund?.budget_code}
                    </small>
                  </div>

                  <div className="fund__details flex column mt-3">
                    <small className="small__title">Beneficiary:</small>
                    <small className="fund__name">
                      {staff?.id === resource.user_id
                        ? "You!!"
                        : resource.owner?.name}
                    </small>
                  </div>

                  <div className="fund__details flex column mt-3">
                    <small className="small__title">Amount:</small>
                    <h1>
                      {expenditure.currency} {formatNumber(expenditure.amount)}
                    </h1>
                    <small>
                      Raised by{" "}
                      {staff?.id === expenditure.user_id
                        ? "You!!"
                        : expenditure.controller?.name}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenditureCardTemplate;
