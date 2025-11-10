import InventoryIssueRepository from "@/app/Repositories/InventoryIssue/InventoryIssueRepository";
import { InventoryIssueResponseData } from "@/app/Repositories/InventoryIssue/data";
import { CardPageComponentProps } from "@/bootstrap";
import React from "react";

const InventoryIssues: React.FC<
  CardPageComponentProps<InventoryIssueResponseData, InventoryIssueRepository>
> = ({ collection, onManageRawData }) => {
  return (
    <div className="row g-3">
      {collection.length === 0 && (
        <div className="col-12">
          <div className="text-center py-5 border rounded bg-white shadow-sm">
            <i className="ri-file-paper-line display-5 text-muted"></i>
            <h5 className="mt-3">No issues recorded</h5>
            <p className="text-muted mb-0">
              Use “Create Issue” to issue materials against a requisition.
            </p>
          </div>
        </div>
      )}

      {collection.map((issue) => (
        <div className="col-lg-4 col-md-6" key={issue.id}>
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <h5 className="mb-1">{issue.reference ?? "Pending"}</h5>
                  <small className="text-muted">
                    Requisition: {issue.requisition_code ?? "—"}
                  </small>
                </div>
                <span className="badge bg-success-subtle text-success">
                  {issue.items_count ?? 0} lines
                </span>
              </div>

              <div className="mb-2">
                <small className="text-muted">Store</small>
                <div className="fw-semibold">{issue.location_name ?? "—"}</div>
              </div>

              <div className="mb-2">
                <small className="text-muted">Issued To</small>
                <div className="fw-semibold">{issue.issued_to_name ?? "—"}</div>
              </div>

              <div>
                <small className="text-muted">Issued At</small>
                <div className="fw-semibold">
                  {issue.issued_at_display ?? "Awaiting submission"}
                </div>
              </div>
            </div>
            <div className="card-footer bg-transparent border-0 pt-0">
              <button
                type="button"
                className="btn btn-outline-success btn-sm"
                onClick={() =>
                  onManageRawData(
                    issue,
                    "manage",
                    `/inventory/issues/${issue.id}/manage`
                  )
                }
              >
                <i className="ri-eye-line me-1"></i>
                View Details
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InventoryIssues;
