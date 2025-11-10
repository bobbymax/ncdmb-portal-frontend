import InventoryReturnRepository from "@/app/Repositories/InventoryReturn/InventoryReturnRepository";
import { InventoryReturnResponseData } from "@/app/Repositories/InventoryReturn/data";
import { CardPageComponentProps } from "@/bootstrap";
import React from "react";

const InventoryReturns: React.FC<
  CardPageComponentProps<InventoryReturnResponseData, InventoryReturnRepository>
> = ({ collection, onManageRawData }) => {
  return (
    <div className="row g-3">
      {collection.length === 0 && (
        <div className="col-12">
          <div className="text-center py-5 border rounded bg-white shadow-sm">
            <i className="ri-inbox-unarchive-line display-5 text-muted"></i>
            <h5 className="mt-3">No returns logged</h5>
            <p className="text-muted mb-0">
              Record material returns to keep stock accurate.
            </p>
          </div>
        </div>
      )}

      {collection.map((record) => (
        <div className="col-lg-4 col-md-6" key={record.id}>
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <h6 className="mb-1">{record.reference ?? `Return #${record.id}`}</h6>
                  <small className="text-muted text-uppercase">
                    {record.type ? record.type.split("_").join(" ") : "—"}
                  </small>
                </div>
                <span className="badge bg-info-subtle text-info">
                  {record.quantity.toFixed(2)}
                </span>
              </div>

              <div className="mb-2">
                <small className="text-muted">Product</small>
                <div className="fw-semibold">{record.product_name ?? "—"}</div>
              </div>

              <div className="mb-2">
                <small className="text-muted">Location</small>
                <div className="fw-semibold">{record.location_name ?? "—"}</div>
              </div>

              <div className="mb-2">
                <small className="text-muted">Processed By</small>
                <div className="fw-semibold">{record.processed_by_name ?? "—"}</div>
              </div>

              <div>
                <small className="text-muted">Returned At</small>
                <div className="fw-semibold">
                  {record.returned_at_display ?? "Awaiting submission"}
                </div>
              </div>
            </div>
            <div className="card-footer bg-transparent border-0 pt-0">
              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
                onClick={() =>
                  onManageRawData(
                    record,
                    "manage",
                    `/inventory/returns/${record.id}/manage`
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

export default InventoryReturns;
