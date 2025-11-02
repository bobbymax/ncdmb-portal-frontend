import { InboundResponseData } from "@/app/Repositories/Inbound/data";
import { FormPageComponentProps } from "@/bootstrap";
import React from "react";

const InboundReport: React.FC<FormPageComponentProps<InboundResponseData>> = ({
  state,
  setState,
  handleChange,
  dependencies,
}) => {
  const formatDate = (date: string | undefined) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="inbound-report-tab" style={{ padding: "1rem" }}>
      {/* Report Header */}
      <div
        style={{
          padding: "1rem 1.25rem",
          backgroundColor: "#f8f9fa",
          borderRadius: "6px",
          marginBottom: "1.5rem",
          borderLeft: "4px solid #137547",
        }}
      >
        <h6
          style={{
            margin: 0,
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "#111827",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Document Report
        </h6>
        <p
          style={{
            margin: "0.25rem 0 0 0",
            fontSize: "0.75rem",
            color: "#6b7280",
          }}
        >
          Reference: {state.ref_no || "Pending"}
        </p>
      </div>

      {/* Document Information */}
      <div
        style={{
          backgroundColor: "white",
          border: "1px solid #e5e7eb",
          borderRadius: "6px",
          marginBottom: "1rem",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "0.75rem 1rem",
            backgroundColor: "#f9fafb",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <h6
            style={{
              margin: 0,
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "#374151",
              textTransform: "uppercase",
              letterSpacing: "0.3px",
            }}
          >
            Sender Information
          </h6>
        </div>
        <div style={{ padding: "1rem" }}>
          <div className="compact-info-grid">
            {/* From Name - Full Width */}
            <div className="compact-info-item full-width">
              <span className="compact-label">
                <i className="ri-user-line" />
                Sender
              </span>
              <span className="compact-value">{state.from_name || "—"}</span>
            </div>

            {/* Email and Phone - Half Width */}
            <div className="compact-info-item">
              <span className="compact-label">
                <i className="ri-mail-line" />
                Email
              </span>
              <span className="compact-value compact-value-small">
                {state.from_email || "—"}
              </span>
            </div>

            <div className="compact-info-item">
              <span className="compact-label">
                <i className="ri-phone-line" />
                Phone
              </span>
              <span className="compact-value compact-value-small">
                {state.from_phone || "—"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Classification & Status */}
      <div
        style={{
          backgroundColor: "white",
          border: "1px solid #e5e7eb",
          borderRadius: "6px",
          marginBottom: "1rem",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "0.75rem 1rem",
            backgroundColor: "#f9fafb",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <h6
            style={{
              margin: 0,
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "#374151",
              textTransform: "uppercase",
              letterSpacing: "0.3px",
            }}
          >
            Classification
          </h6>
        </div>
        <div style={{ padding: "1rem" }}>
          <div className="compact-info-grid">
            {/* Priority and Security - Half Width with Badges */}
            <div className="compact-info-item">
              <span className="compact-label">
                <i className="ri-flag-line" />
                Priority
              </span>
              <span
                className={`compact-badge priority-${state.priority || "low"}`}
              >
                <i
                  className={
                    state.priority === "high"
                      ? "ri-arrow-up-line"
                      : state.priority === "medium"
                      ? "ri-subtract-line"
                      : "ri-arrow-down-line"
                  }
                />
                {state.priority || "Low"}
              </span>
            </div>

            <div className="compact-info-item">
              <span className="compact-label">
                <i className="ri-shield-line" />
                Security
              </span>
              <span className="compact-badge security-badge">
                <i className="ri-shield-check-line" />
                {state.security_class || "Public"}
              </span>
            </div>

            <div className="compact-info-item">
              <span className="compact-label">
                <i className="ri-inbox-line" />
                Channel
              </span>
              <span
                className="compact-value compact-value-small"
                style={{ textTransform: "capitalize" }}
              >
                {state.channel || "—"}
              </span>
            </div>

            <div className="compact-info-item">
              <span className="compact-label">
                <i className="ri-checkbox-circle-line" />
                Status
              </span>
              <span
                className="compact-value compact-value-small"
                style={{ textTransform: "capitalize" }}
              >
                {state.status || "—"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div
        style={{
          backgroundColor: "white",
          border: "1px solid #e5e7eb",
          borderRadius: "6px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "0.75rem 1rem",
            backgroundColor: "#f9fafb",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <h6
            style={{
              margin: 0,
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "#374151",
              textTransform: "uppercase",
              letterSpacing: "0.3px",
            }}
          >
            Timeline
          </h6>
        </div>
        <div style={{ padding: "1rem" }}>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: "0.813rem", color: "#6b7280" }}>
                <i
                  className="ri-calendar-check-line"
                  style={{ marginRight: "0.5rem", color: "#137547" }}
                />
                Received
              </span>
              <span
                style={{
                  fontSize: "0.813rem",
                  color: "#111827",
                  fontWeight: 500,
                }}
              >
                {formatDate(state.received_at)}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: "0.813rem", color: "#6b7280" }}>
                <i
                  className="ri-mail-send-line"
                  style={{ marginRight: "0.5rem", color: "#137547" }}
                />
                Mailed
              </span>
              <span
                style={{
                  fontSize: "0.813rem",
                  color: "#111827",
                  fontWeight: 500,
                }}
              >
                {formatDate(state.mailed_at)}
              </span>
            </div>

            {state.published_at && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: "0.813rem", color: "#6b7280" }}>
                  <i
                    className="ri-send-plane-line"
                    style={{ marginRight: "0.5rem", color: "#137547" }}
                  />
                  Published
                </span>
                <span
                  style={{
                    fontSize: "0.813rem",
                    color: "#111827",
                    fontWeight: 500,
                  }}
                >
                  {formatDate(state.published_at)}
                </span>
              </div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: "0.813rem", color: "#6b7280" }}>
                <i
                  className="ri-time-line"
                  style={{ marginRight: "0.5rem", color: "#137547" }}
                />
                Last Updated
              </span>
              <span
                style={{
                  fontSize: "0.813rem",
                  color: "#111827",
                  fontWeight: 500,
                }}
              >
                {formatDate(state.updated_at)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InboundReport;
