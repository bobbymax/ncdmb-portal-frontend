import React, { useMemo } from "react";
import { ProcessCardResponseData } from "@/app/Repositories/ProcessCard/data";
import { ProgressTrackerResponseData } from "@/app/Repositories/ProgressTracker/data";
import { DocumentResponseData } from "@/app/Repositories/Document/data";
import { usePaperBoard } from "app/Context/PaperBoardContext";
import { BaseResponse } from "@/app/Repositories/BaseRepository";
import { PaymentBatchResponseData } from "@/app/Repositories/PaymentBatch/data";

interface EmployeeBudgetClearProps {
  processCard: ProcessCardResponseData;
  currentProcess: ProgressTrackerResponseData;
  existingDocument: DocumentResponseData | null;
  resource: BaseResponse | null;
}

const EmployeeBudgetClear: React.FC<EmployeeBudgetClearProps> = ({
  processCard,
  currentProcess,
  existingDocument,
  resource,
}) => {
  const { state } = usePaperBoard();

  const payload: {
    batch: PaymentBatchResponseData;
    document: DocumentResponseData;
  } | null = useMemo(() => {
    if (!resource || !existingDocument) return null;
    return {
      batch: resource as PaymentBatchResponseData,
      document: existingDocument,
    };
  }, [resource, existingDocument]);

  //   console.log("Exisiting: ", existingDocument);
  //   console.log("Resource: ", resource);
  console.log("Batch: ", payload);
  return (
    <div className="employee-budget-clear-card">
      <div className="card">
        <div className="card-body">
          <h6 className="card-title">
            <i className="ri-money-dollar-circle-line me-2"></i>
            Employee Budget Clearance
          </h6>

          <div className="mt-3">
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">ProcessCard Name:</label>
                <p className="mb-0">{processCard.name}</p>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Current Stage:</label>
                <p className="mb-0">
                  Stage {currentProcess.order}:{" "}
                  {currentProcess.stage?.name || "Unknown"}
                </p>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">
                  Document Reference:
                </label>
                <p className="mb-0">{state.existingDocument?.ref || "N/A"}</p>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Service:</label>
                <p className="mb-0">{processCard.service}</p>
              </div>
            </div>

            <hr />

            <div className="alert alert-info">
              <i className="ri-information-line me-2"></i>
              <strong>This is a dynamic ProcessCard component!</strong>
              <br />
              <small>Component: {processCard.component}</small>
            </div>

            <div className="mt-3">
              <h6>ProcessCard Rules:</h6>
              <div className="row">
                <div className="col-md-4">
                  <small className="text-muted">Currency:</small>
                  <p className="mb-1">{processCard.rules?.currency || "N/A"}</p>
                </div>
                <div className="col-md-4">
                  <small className="text-muted">Transaction Type:</small>
                  <p className="mb-1">
                    {processCard.rules?.transaction || "N/A"}
                  </p>
                </div>
                <div className="col-md-4">
                  <small className="text-muted">Generate Transactions:</small>
                  <p className="mb-1">
                    {processCard.rules?.generate_transactions ? "Yes" : "No"}
                  </p>
                </div>
              </div>
            </div>

            {/* Add your custom component logic here */}
            <div className="mt-4">
              <button className="btn btn-primary">
                <i className="ri-check-line me-2"></i>
                Clear Budget
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeBudgetClear;
