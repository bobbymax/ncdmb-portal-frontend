import { ClaimResponseData } from "app/Repositories/Claim/data";
import React from "react";
import ClaimRepository from "app/Repositories/Claim/ClaimRepository";
import { DocumentControlStateProps } from "resources/views/pages/ViewResourcePage";
import fileIcon from "../../../../assets/images/file-icon.webp";
import wallet from "../../../../assets/images/wallet.png";
import { useClaimComponents } from "app/Hooks/useClaimComponents";
import { formatCurrency } from "app/Support/Helpers";

const ClaimDetails: React.FC<
  DocumentControlStateProps<ClaimResponseData, ClaimRepository>
> = ({ data, Repo, loading, view, onPeformAction, dependencies }) => {
  console.log(data);

  const { getDuration } = useClaimComponents();

  const remender = data.expenses.length - 5;

  return (
    <>
      <div className="row">
        <div className="col-md-7 mb-3">
          <div className="details-header">
            <small>{data.code}</small>
            <div className="title-top">
              <small className="did">purpose of expense analysis</small>
              <h1>{data.title}</h1>
            </div>
          </div>
        </div>
        <div className="col-md-5 mb-3">
          <div className="file-folder-container">
            {data.uploads?.map((upload, i) => (
              <div key={i} className="file-folder">
                <div className="icon-cage">
                  <i className="ri-file-list-3-line" />
                  <small>{upload.extension}</small>
                </div>
                <div className="file-blob">
                  <img src={fileIcon} alt="flie icon" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="col-md-8 mb-3">
          <h4 className="mb-4 expense-title-header">Expense Analysis...</h4>
          <div className="expenses-display">
            {data.expenses.map(
              (expense, i) =>
                i < 5 && (
                  <div key={i} className="expense-stripe">
                    <div className="s_n">
                      <h3>{i + 1}.</h3>
                    </div>
                    <div className="expense-description">
                      <p>{expense.description}</p>
                      <small>
                        {getDuration(data.start_date, data.end_date)}
                      </small>
                    </div>
                    <div className="expense-footer">
                      <h3>{formatCurrency(expense.total_amount_spent)}</h3>
                    </div>
                  </div>
                )
            )}
            {remender > 0 && (
              <div className="expense-stripe more-expenses">
                <p>{remender} more expenses...</p>
              </div>
            )}
          </div>
        </div>
        <div className="col-md-4 mb-3 mt-4">
          <div className="invoice-section">
            <div className="amount-component mb-3">
              <h5>Sponsoring Department</h5>
              <h1>{data.department_name}</h1>
            </div>
            <div className="amount-component mt-5 mb-3">
              <h5>Total Amount Spent</h5>
              <h1>{formatCurrency(data.total_amount_spent)}</h1>
            </div>
            <div className="amount-component mb-3">
              <h5>Total Approved Amount</h5>
              <h1>{formatCurrency(data.total_amount_approved)}</h1>
            </div>
            <div className="amount-component mb-3">
              <h5>Status</h5>
              <p>{data.status}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="wallet-img">
        <img src={wallet} alt="wallet" />
      </div>
    </>
  );
};

export default ClaimDetails;
