import InventoryLocationRepository from "@/app/Repositories/InventoryLocation/InventoryLocationRepository";
import { InventoryLocationResponseData } from "@/app/Repositories/InventoryLocation/data";
import { CardPageComponentProps } from "@/bootstrap";
import React from "react";

const typeStyles: Record<string, { color: string; icon: string }> = {
  warehouse: { color: "#2f855a", icon: "ri-warehouse-line" },
  site: { color: "#2b6cb0", icon: "ri-roadster-line" },
  vehicle: { color: "#b7791f", icon: "ri-truck-line" },
  office: { color: "#805ad5", icon: "ri-building-4-line" },
};

const InventoryLocations: React.FC<
  CardPageComponentProps<
    InventoryLocationResponseData,
    InventoryLocationRepository
  >
> = ({ collection, onManageRawData }) => {
  return (
    <div className="row g-3">
      {collection.length === 0 && (
        <div className="col-12">
          <div className="text-center py-5 border rounded bg-white shadow-sm">
            <i className="ri-map-pin-line display-5 text-muted"></i>
            <h5 className="mt-3">No locations configured yet</h5>
            <p className="text-muted mb-0">
              Click “Add Location” to register your first storage point.
            </p>
          </div>
        </div>
      )}

      {collection.map((location) => {
        const type = typeStyles[location.type] ?? typeStyles.warehouse;
        const departmentName =
          (location.department as { name?: string } | null)?.name ?? "—";
        const parentName =
          (location.parent as { name?: string } | null)?.name ?? "Top Level";
        return (
          <div className="col-lg-4 col-md-6" key={location.id}>
            <div className="card h-100 shadow-sm border-0">
              <div className="card-body">
                <div className="d-flex align-items-start gap-3 mb-3">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{
                      width: 48,
                      height: 48,
                      backgroundColor: `${type.color}15`,
                    }}
                  >
                    <i className={type.icon} style={{ color: type.color }} />
                  </div>
                  <div>
                    <h5 className="mb-1 text-capitalize">{location.name}</h5>
                    <small className="text-muted">Code: {location.code}</small>
                  </div>
                </div>

                <div className="d-flex justify-content-between py-2 border-bottom">
                  <span className="text-muted">Type</span>
                  <span className="fw-semibold text-uppercase" style={{ color: type.color }}>
                    {location.type}
                  </span>
                </div>
                <div className="d-flex justify-content-between py-2 border-bottom">
                  <span className="text-muted">Department</span>
                  <span className="fw-semibold">{departmentName}</span>
                </div>
                <div className="d-flex justify-content-between py-2 border-bottom">
                  <span className="text-muted">Parent</span>
                  <span className="fw-semibold">{parentName}</span>
                </div>
                <div className="d-flex justify-content-between py-2">
                  <span className="text-muted">Created</span>
                  <span className="fw-semibold">
                    {location.created_at
                      ? new Date(location.created_at).toLocaleDateString()
                      : "—"}
                  </span>
                </div>
              </div>
              <div className="card-footer bg-transparent border-0 pt-0">
                <button
                  type="button"
                  className="btn btn-outline-success btn-sm"
                  onClick={() =>
                    onManageRawData(
                      location,
                      "manage",
                      `/inventory/locations/${location.id}/manage`
                    )
                  }
                >
                  <i className="ri-settings-3-line me-1" />
                  Manage
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default InventoryLocations;