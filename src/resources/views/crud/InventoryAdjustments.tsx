import InventoryAdjustmentRepository from "@/app/Repositories/InventoryAdjustment/InventoryAdjustmentRepository";
import { InventoryAdjustmentResponseData } from "@/app/Repositories/InventoryAdjustment/data";
import { CardPageComponentProps } from "@/bootstrap";
import React from "react";

const reasonColours: Record<string, string> = {
  cycle_count: "#2b6cb0",
  damage: "#c53030",
  shrinkage: "#b7791f",
  rebalance: "#2f855a",
  other: "#4a5568",
};

const InventoryAdjustments: React.FC<
  CardPageComponentProps<
    InventoryAdjustmentResponseData,
    InventoryAdjustmentRepository
  >
> = ({ collection, onManageRawData }) => {
  return (
    <div className="row g-3">
      {collection.length === 0 && (
        <div className="col-12">
          <div className="text-center py-5 border rounded bg-white shadow-sm">
            <i className="ri-adjustment-line display-5 text-muted"></i>
            <h5 className="mt-3">No adjustments recorded</h5>
            <p className="text-muted mb-0">
              Use “Record Adjustment” to align stock levels with reality.
            </p>
          </div>
        </div>
      )}

      {collection.map((adjustment) => {
        const colour = reasonColours[adjustment.reason] ?? "#4a5568";
        return (
          <div className="col-lg-4 col-md-6" key={adjustment.id}>
            <div className="card h-100 shadow-sm border-0">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h6 className="mb-1">{adjustment.location_name ?? "—"}</h6>
                    <small className="text-muted">
                      {adjustment.adjusted_at_display ?? "Pending"}
                    </small>
                  </div>
                  <span
                    className="badge"
                    style={{ backgroundColor: `${colour}20`, color: colour }}
                  >
                    {adjustment.reason.split("_").join(" ")}
                  </span>
                </div>

                <div className="mb-2">
                  <small className="text-muted">Lines</small>
                  <div className="fw-semibold">{adjustment.lines_count ?? 0}</div>
                </div>

                <div>
                  <small className="text-muted">Performed By</small>
                  <div className="fw-semibold">{adjustment.actor_name ?? "—"}</div>
                </div>
              </div>
              <div className="card-footer bg-transparent border-0 pt-0">
                <button
                  type="button"
                  className="btn btn-outline-warning btn-sm"
                  onClick={() =>
                    onManageRawData(
                      adjustment,
                      "manage",
                      `/inventory/adjustments/${adjustment.id}/manage`
                    )
                  }
                >
                  <i className="ri-eye-line me-1"></i>
                  View Details
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default InventoryAdjustments;
