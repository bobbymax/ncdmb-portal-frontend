import { ClaimResponseData } from "app/Repositories/Claim/data";
import React from "react";
import ClaimRepository from "app/Repositories/Claim/ClaimRepository";
import { DocumentControlStateProps } from "resources/views/pages/ViewResourcePage";
import { useClaimComponents } from "app/Hooks/useClaimComponents";
import { formatCurrency } from "app/Support/Helpers";
import imageIcon from "../../../assets/images/image-icon.png";
import pdfIcon from "../../../assets/images/pdf-icon.webp";
import MediaFiles from "app/Support/MediaFiles";

const ClaimDetails: React.FC<
  DocumentControlStateProps<ClaimResponseData, ClaimRepository>
> = ({ data }) => {
  const { getDuration } = useClaimComponents();

  const statusKey =
    data.status && data.status in MediaFiles.statuses ? data.status : "pending";

  return (
    <>
      <div className="row">
        <div className="col-md-12 mb-5">
          <div className="details-header">
            <small>{data.code}</small>
            <div className="title-top">
              <small className="did">purpose of expense analysis</small>
              <h1>{data.title}</h1>
            </div>
          </div>
        </div>

        <div className="col-md-7 mb-3">
          <div className="expenses-display">
            {data.expenses.map((expense, i) => (
              <div key={i} className="expense-stripe">
                <div className="s_n">
                  <h3>{i + 1}.</h3>
                </div>
                <div className="expense-description">
                  <p>{expense.description}</p>
                  <small>{getDuration(data.start_date, data.end_date)}</small>
                </div>
                <div className="expense-footer">
                  <h3>{formatCurrency(expense.total_amount_spent)}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Receipt Section */}
        <div className="col-md-4 mb-3 mt-4">
          <div className="invoice-section">
            <div className="amount-component mb-3">
              <h5>Sponsoring Department</h5>
              <h1>{data.department_name}</h1>
            </div>
            <div className="amount-component mt-3 mb-3">
              <h5>Total Amount Spent</h5>
              <h1>{formatCurrency(data.total_amount_spent)}</h1>
            </div>
            <div className="amount-component mb-3">
              <h5>Total Approved Amount</h5>
              <h1>{formatCurrency(data.total_amount_approved)}</h1>
            </div>
            <div className="amount-component mb-3">
              <h5>Status</h5>
              <div className="status-img">
                <img
                  src={
                    MediaFiles.statuses[
                      statusKey as keyof typeof MediaFiles.statuses
                    ]
                  }
                  alt="status icon"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-12 mb-3">
          {/* The new files position */}
          <div className="files_uploaded_container">
            {data.uploads?.map((upload, i) => (
              <div key={i} className="files_item_container">
                <img
                  src={upload.extension !== "pdf" ? imageIcon : pdfIcon}
                  alt="Flies Uploaded"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default ClaimDetails;
