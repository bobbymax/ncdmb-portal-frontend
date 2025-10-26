import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "app/Context/AuthContext";
import { useResourceContext } from "app/Context/ResourceContext";
import { ApiService } from "app/Services/ApiService";
import Alert from "app/Support/Alert";
import "resources/assets/css/profile-settings.css";

type TabType = "personal" | "account" | "preferences" | "activity";

const ProfileSettings = () => {
  const { staff } = useAuth();
  const { getResourceById } = useResourceContext();
  const [activeTab, setActiveTab] = useState<TabType>("personal");
  const [defaultPageId, setDefaultPageId] = useState<number>(
    staff?.default_page_id || 0
  );
  const [saving, setSaving] = useState(false);

  // Memoize API service instance
  const apiService = useMemo(() => new ApiService(), []);

  // Type assertion for extended staff data
  const staffData = staff as any;

  // Memoize related data lookups
  const department = useMemo(
    () =>
      staff?.department_id
        ? getResourceById("departments", staff.department_id)
        : null,
    [staff?.department_id, getResourceById]
  );

  const location = useMemo(
    () =>
      staffData?.location_id
        ? getResourceById("departments", staffData.location_id)
        : null,
    [staffData?.location_id, getResourceById]
  );

  const gradeLevel = useMemo(
    () => staff?.grade_level_object || null,
    [staff?.grade_level_object]
  );

  const role = useMemo(() => staff?.role || null, [staff?.role]);

  const handleSavePreferences = async () => {
    setSaving(true);
    try {
      await apiService.put(`users/${staff?.id}`, {
        default_page_id: defaultPageId,
      });
      Alert.success(
        "Preferences Saved",
        "Your preferences have been updated successfully"
      );
    } catch (error: any) {
      Alert.error(
        "Error",
        error.response?.data?.message || "Failed to save preferences"
      );
    } finally {
      setSaving(false);
    }
  };

  const formatDate = useCallback((dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  const getEmploymentTypeLabel = useCallback((type: string) => {
    const labels: Record<string, string> = {
      permanent: "Permanent Staff",
      contract: "Contract Staff",
      adhoc: "Ad-hoc",
      secondment: "Secondment",
      support: "Support Staff",
      admin: "Admin",
    };
    return labels[type] || type;
  }, []);

  const getStatusLabel = useCallback((status: string) => {
    const labels: Record<string, string> = {
      available: "Available",
      "official-assignment": "Official Assignment",
      training: "Training",
      leave: "On Leave",
      study: "Study Leave",
      secondment: "Secondment",
      other: "Other",
    };
    return labels[status] || status;
  }, []);

  const getStatusColor = useCallback((status: string) => {
    const colors: Record<string, string> = {
      available: "#22c55e",
      "official-assignment": "#3b82f6",
      training: "#a855f7",
      leave: "#f59e0b",
      study: "#8b5cf6",
      secondment: "#ec4899",
      other: "#64748b",
    };
    return colors[status] || "#64748b";
  }, []);

  return (
    <div className="profile-settings-page">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            {/* Profile Header Card */}
            <div className="card profile-header-card mb-4">
              <div className="card-body p-4">
                <div className="d-flex align-items-center gap-4">
                  {/* Avatar */}
                  <div className="position-relative">
                    <div className="profile-avatar-large">
                      {staff?.avatar ? (
                        <img src={staff.avatar} alt={staff.name} />
                      ) : (
                        <span>
                          {staff?.name
                            ?.split(" ")
                            .map((n) => n.charAt(0))
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </span>
                      )}
                    </div>
                    <div
                      className="profile-status-indicator"
                      style={{
                        backgroundColor: getStatusColor(
                          staffData?.status || "available"
                        ),
                      }}
                      title={getStatusLabel(staffData?.status || "available")}
                    ></div>
                  </div>

                  {/* User Info */}
                  <div className="flex-grow-1">
                    <h2
                      className="mb-2"
                      style={{
                        fontSize: "2rem",
                        fontWeight: "700",
                        color: "white",
                        letterSpacing: "-0.5px",
                      }}
                    >
                      {staff?.name}
                    </h2>
                    <p
                      className="mb-3"
                      style={{
                        fontSize: "1.05rem",
                        color: "rgba(255, 255, 255, 0.9)",
                      }}
                    >
                      {staffData?.job_title || "N/A"} •{" "}
                      {department?.name || "N/A"}
                    </p>
                    <div className="d-flex gap-2 flex-wrap">
                      <span
                        className="badge"
                        style={{
                          backgroundColor: "rgba(255, 255, 255, 0.2)",
                          backdropFilter: "blur(10px)",
                          color: "white",
                          fontSize: "0.85rem",
                          padding: "8px 14px",
                          fontWeight: "500",
                          border: "1px solid rgba(255, 255, 255, 0.3)",
                          borderRadius: "8px",
                        }}
                      >
                        <i className="ri-hashtag me-1"></i>
                        {staff?.staff_no}
                      </span>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: "rgba(255, 255, 255, 0.2)",
                          backdropFilter: "blur(10px)",
                          color: "white",
                          fontSize: "0.85rem",
                          padding: "8px 14px",
                          fontWeight: "500",
                          border: "1px solid rgba(255, 255, 255, 0.3)",
                          borderRadius: "8px",
                        }}
                      >
                        <i className="ri-user-star-line me-1"></i>
                        {getStatusLabel(staffData?.status || "available")}
                      </span>
                      {staffData?.is_admin === 1 && (
                        <span
                          className="badge"
                          style={{
                            backgroundColor: "rgba(251, 191, 36, 0.2)",
                            backdropFilter: "blur(10px)",
                            color: "#fef3c7",
                            fontSize: "0.85rem",
                            padding: "8px 14px",
                            fontWeight: "500",
                            border: "1px solid rgba(251, 191, 36, 0.3)",
                            borderRadius: "8px",
                          }}
                        >
                          <i className="ri-vip-crown-line me-1"></i>
                          Administrator
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div
              className="card border-0 mb-4"
              style={{
                borderRadius: "16px",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
              }}
            >
              <div
                className="card-header bg-white border-0"
                style={{
                  borderRadius: "16px 16px 0 0",
                  padding: "1.5rem 1.5rem 0",
                }}
              >
                <ul className="nav nav-tabs border-0" style={{ gap: "0.5rem" }}>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${
                        activeTab === "personal" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("personal")}
                      style={{
                        border: "none",
                        background:
                          activeTab === "personal"
                            ? "linear-gradient(135deg, #137547 0%, #0f5c38 100%)"
                            : "transparent",
                        color: activeTab === "personal" ? "white" : "#64748b",
                        fontWeight: "600",
                        borderRadius: "10px",
                        padding: "10px 20px",
                        transition: "all 0.3s ease",
                      }}
                    >
                      <i className="ri-user-line me-2"></i>
                      Personal Info
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${
                        activeTab === "account" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("account")}
                      style={{
                        border: "none",
                        background:
                          activeTab === "account"
                            ? "linear-gradient(135deg, #137547 0%, #0f5c38 100%)"
                            : "transparent",
                        color: activeTab === "account" ? "white" : "#64748b",
                        fontWeight: "600",
                        borderRadius: "10px",
                        padding: "10px 20px",
                        transition: "all 0.3s ease",
                      }}
                    >
                      <i className="ri-shield-user-line me-2"></i>
                      Account & Access
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${
                        activeTab === "preferences" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("preferences")}
                      style={{
                        border: "none",
                        background:
                          activeTab === "preferences"
                            ? "linear-gradient(135deg, #137547 0%, #0f5c38 100%)"
                            : "transparent",
                        color:
                          activeTab === "preferences" ? "white" : "#64748b",
                        fontWeight: "600",
                        borderRadius: "10px",
                        padding: "10px 20px",
                        transition: "all 0.3s ease",
                      }}
                    >
                      <i className="ri-settings-3-line me-2"></i>
                      Preferences
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${
                        activeTab === "activity" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("activity")}
                      style={{
                        border: "none",
                        background:
                          activeTab === "activity"
                            ? "linear-gradient(135deg, #137547 0%, #0f5c38 100%)"
                            : "transparent",
                        color: activeTab === "activity" ? "white" : "#64748b",
                        fontWeight: "600",
                        borderRadius: "10px",
                        padding: "10px 20px",
                        transition: "all 0.3s ease",
                      }}
                    >
                      <i className="ri-line-chart-line me-2"></i>
                      Activity
                    </button>
                  </li>
                </ul>
              </div>

              <div className="card-body" style={{ padding: "2rem" }}>
                {/* Personal Info Tab */}
                {activeTab === "personal" && (
                  <div
                    className="tab-content-section"
                    style={{ animation: "fadeIn 0.3s ease" }}
                  >
                    <div
                      className="mb-4 pb-3"
                      style={{ borderBottom: "2px solid #f1f5f9" }}
                    >
                      <h5
                        className="mb-1"
                        style={{
                          fontSize: "1.25rem",
                          fontWeight: "700",
                          color: "#1e293b",
                        }}
                      >
                        Personal Information
                      </h5>
                      <p
                        className="text-muted mb-0"
                        style={{ fontSize: "0.9rem" }}
                      >
                        Your basic profile information
                      </p>
                    </div>

                    <div className="row g-4">
                      <div className="col-md-4">
                        <label className="form-label text-muted small">
                          First Name
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={staffData?.firstname || "N/A"}
                          readOnly
                          style={{ backgroundColor: "#f9fafb" }}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label text-muted small">
                          Middle Name
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={staffData?.middlename || "N/A"}
                          readOnly
                          style={{ backgroundColor: "#f9fafb" }}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label text-muted small">
                          Surname
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={staffData?.surname || "N/A"}
                          readOnly
                          style={{ backgroundColor: "#f9fafb" }}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-muted small">
                          Staff Number
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={staff?.staff_no || "N/A"}
                          readOnly
                          style={{ backgroundColor: "#f9fafb" }}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-muted small">
                          Email Address
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          value={staff?.email || "N/A"}
                          readOnly
                          style={{ backgroundColor: "#f9fafb" }}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-muted small">
                          Job Title
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={staffData?.job_title || "N/A"}
                          readOnly
                          style={{ backgroundColor: "#f9fafb" }}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-muted small">
                          Gender
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={
                            staffData?.gender
                              ? staffData.gender.charAt(0).toUpperCase() +
                                staffData.gender.slice(1)
                              : "N/A"
                          }
                          readOnly
                          style={{ backgroundColor: "#f9fafb" }}
                        />
                      </div>
                      <div className="col-md-12">
                        <label className="form-label text-muted small">
                          Date Joined
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={formatDate(staffData?.date_joined)}
                          readOnly
                          style={{ backgroundColor: "#f9fafb" }}
                        />
                      </div>
                    </div>

                    <div
                      className="alert border-0 mt-4"
                      style={{
                        background:
                          "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                        borderRadius: "12px",
                      }}
                    >
                      <i
                        className="ri-information-line me-2"
                        style={{ color: "#1e40af" }}
                      ></i>
                      <small style={{ color: "#1e40af", fontWeight: "500" }}>
                        To update your personal information, please contact HR
                        department.
                      </small>
                    </div>
                  </div>
                )}

                {/* Account & Access Tab */}
                {activeTab === "account" && (
                  <div
                    className="tab-content-section"
                    style={{ animation: "fadeIn 0.3s ease" }}
                  >
                    <div
                      className="mb-4 pb-3"
                      style={{ borderBottom: "2px solid #f1f5f9" }}
                    >
                      <h5
                        className="mb-1"
                        style={{
                          fontSize: "1.25rem",
                          fontWeight: "700",
                          color: "#1e293b",
                        }}
                      >
                        Account & Access
                      </h5>
                      <p
                        className="text-muted mb-0"
                        style={{ fontSize: "0.9rem" }}
                      >
                        Your role, permissions, and organizational details
                      </p>
                    </div>

                    {/* Organization Details */}
                    <div className="mb-4">
                      <h6
                        className="mb-3"
                        style={{
                          fontSize: "0.95rem",
                          fontWeight: "600",
                          color: "#64748b",
                        }}
                      >
                        Organization
                      </h6>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <div
                            className="d-flex align-items-center gap-3 p-4 border-0"
                            style={{
                              background:
                                "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
                              borderRadius: "12px",
                            }}
                          >
                            <div
                              style={{
                                width: "48px",
                                height: "48px",
                                borderRadius: "12px",
                                background:
                                  "linear-gradient(135deg, #137547 0%, #0f5c38 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0 4px 12px rgba(19, 117, 71, 0.2)",
                              }}
                            >
                              <i
                                className="ri-building-line"
                                style={{ fontSize: "1.5rem", color: "white" }}
                              ></i>
                            </div>
                            <div>
                              <small
                                className="text-muted d-block mb-1"
                                style={{
                                  fontSize: "0.75rem",
                                  fontWeight: "500",
                                }}
                              >
                                Department
                              </small>
                              <strong
                                style={{
                                  fontSize: "0.95rem",
                                  color: "#1e293b",
                                }}
                              >
                                {department?.name || "N/A"}
                              </strong>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div
                            className="d-flex align-items-center gap-3 p-4 border-0"
                            style={{
                              background:
                                "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
                              borderRadius: "12px",
                            }}
                          >
                            <div
                              style={{
                                width: "48px",
                                height: "48px",
                                borderRadius: "12px",
                                background:
                                  "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0 4px 12px rgba(245, 158, 11, 0.2)",
                              }}
                            >
                              <i
                                className="ri-map-pin-line"
                                style={{ fontSize: "1.5rem", color: "white" }}
                              ></i>
                            </div>
                            <div>
                              <small
                                className="text-muted d-block mb-1"
                                style={{
                                  fontSize: "0.75rem",
                                  fontWeight: "500",
                                }}
                              >
                                Location
                              </small>
                              <strong
                                style={{
                                  fontSize: "0.95rem",
                                  color: "#1e293b",
                                }}
                              >
                                {location?.name || "N/A"}
                              </strong>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div
                            className="d-flex align-items-center gap-3 p-4 border-0"
                            style={{
                              background:
                                "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                              borderRadius: "12px",
                            }}
                          >
                            <div
                              style={{
                                width: "48px",
                                height: "48px",
                                borderRadius: "12px",
                                background:
                                  "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0 4px 12px rgba(59, 130, 246, 0.2)",
                              }}
                            >
                              <i
                                className="ri-bar-chart-line"
                                style={{ fontSize: "1.5rem", color: "white" }}
                              ></i>
                            </div>
                            <div>
                              <small
                                className="text-muted d-block mb-1"
                                style={{
                                  fontSize: "0.75rem",
                                  fontWeight: "500",
                                }}
                              >
                                Grade Level
                              </small>
                              <strong
                                style={{
                                  fontSize: "0.95rem",
                                  color: "#1e293b",
                                }}
                              >
                                {gradeLevel?.name ||
                                  `GL ${staff?.grade_level_id || "N/A"}`}
                              </strong>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div
                            className="d-flex align-items-center gap-3 p-4 border-0"
                            style={{
                              background:
                                "linear-gradient(135deg, #fae8ff 0%, #f3e8ff 100%)",
                              borderRadius: "12px",
                            }}
                          >
                            <div
                              style={{
                                width: "48px",
                                height: "48px",
                                borderRadius: "12px",
                                background:
                                  "linear-gradient(135deg, #a855f7 0%, #9333ea 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0 4px 12px rgba(168, 85, 247, 0.2)",
                              }}
                            >
                              <i
                                className="ri-briefcase-line"
                                style={{ fontSize: "1.5rem", color: "white" }}
                              ></i>
                            </div>
                            <div>
                              <small
                                className="text-muted d-block mb-1"
                                style={{
                                  fontSize: "0.75rem",
                                  fontWeight: "500",
                                }}
                              >
                                Employment Type
                              </small>
                              <strong
                                style={{
                                  fontSize: "0.95rem",
                                  color: "#1e293b",
                                }}
                              >
                                {getEmploymentTypeLabel(staffData?.type || "")}
                              </strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Role & Permissions */}
                    <div className="mb-4">
                      <h6
                        className="mb-3"
                        style={{
                          fontSize: "0.95rem",
                          fontWeight: "600",
                          color: "#64748b",
                        }}
                      >
                        Role & Permissions
                      </h6>
                      <div className="p-3 bg-light rounded mb-3">
                        <div className="d-flex align-items-center gap-3">
                          <i
                            className="ri-user-settings-line"
                            style={{ fontSize: "1.5rem", color: "#137547" }}
                          ></i>
                          <div className="flex-grow-1">
                            <small className="text-muted d-block">
                              Current Role
                            </small>
                            <strong>{role?.name || "N/A"}</strong>
                          </div>
                          {staffData?.is_admin === 1 && (
                            <span className="badge bg-warning">
                              <i className="ri-vip-crown-line me-1"></i>
                              Admin
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Groups */}
                      {staff?.groups && staff.groups.length > 0 && (
                        <div>
                          <small className="text-muted d-block mb-2">
                            Groups & Teams
                          </small>
                          <div className="d-flex flex-wrap gap-2">
                            {staff.groups.map((group: any) => (
                              <span
                                key={group.id}
                                className="badge"
                                style={{
                                  backgroundColor: "#ede9fe",
                                  color: "#6366f1",
                                  fontSize: "0.8rem",
                                  padding: "6px 12px",
                                  fontWeight: "500",
                                  border: "1px solid #c7d2fe",
                                }}
                              >
                                <i className="ri-team-line me-1"></i>
                                {group.label || group.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="alert alert-info">
                      <i className="ri-information-line me-2"></i>
                      <small>
                        Role and access permissions are managed by system
                        administrators.
                      </small>
                    </div>
                  </div>
                )}

                {/* Preferences Tab */}
                {activeTab === "preferences" && (
                  <div
                    className="tab-content-section"
                    style={{ animation: "fadeIn 0.3s ease" }}
                  >
                    <div
                      className="mb-4 pb-3"
                      style={{ borderBottom: "2px solid #f1f5f9" }}
                    >
                      <h5
                        className="mb-1"
                        style={{
                          fontSize: "1.25rem",
                          fontWeight: "700",
                          color: "#1e293b",
                        }}
                      >
                        Preferences
                      </h5>
                      <p
                        className="text-muted mb-0"
                        style={{ fontSize: "0.9rem" }}
                      >
                        Customize your experience
                      </p>
                    </div>

                    <div
                      className="mb-4 p-4"
                      style={{
                        background: "#f8fafc",
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <label
                        className="form-label mb-3"
                        style={{ fontWeight: "600", color: "#1e293b" }}
                      >
                        <i
                          className="ri-home-line me-2"
                          style={{ color: "#137547" }}
                        ></i>
                        Default Landing Page
                      </label>
                      <select
                        className="form-select"
                        value={defaultPageId}
                        onChange={(e) =>
                          setDefaultPageId(Number(e.target.value))
                        }
                        style={{
                          borderRadius: "10px",
                          border: "2px solid #e2e8f0",
                          padding: "12px 16px",
                          fontSize: "0.95rem",
                        }}
                      >
                        <option value={0}>Select default page...</option>
                        {staff?.pages?.map((page) => (
                          <option key={page.id} value={page.id}>
                            {page.name}
                          </option>
                        ))}
                      </select>
                      <small className="text-muted d-block mt-2">
                        <i className="ri-information-line me-1"></i>
                        This is the page you&apos;ll see when you first log in
                      </small>
                    </div>

                    {/* Notification Preferences Section */}
                    <div className="mb-4">
                      <h6
                        className="mb-3"
                        style={{
                          fontSize: "1rem",
                          fontWeight: "600",
                          color: "#1e293b",
                        }}
                      >
                        <i
                          className="ri-notification-line me-2"
                          style={{ color: "#137547" }}
                        ></i>
                        Notification Settings
                      </h6>
                      <div
                        className="alert border-0"
                        style={{
                          background:
                            "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
                          borderRadius: "12px",
                        }}
                      >
                        <div className="d-flex align-items-start gap-2">
                          <i
                            className="ri-time-line"
                            style={{
                              color: "#92400e",
                              fontSize: "1.25rem",
                              marginTop: "2px",
                            }}
                          ></i>
                          <small
                            style={{ color: "#92400e", fontWeight: "500" }}
                          >
                            Notification preferences will be available soon.
                            You&apos;ll be able to customize how you receive
                            updates about documents, approvals, and system
                            activities.
                          </small>
                        </div>
                      </div>
                    </div>

                    {/* Save Button */}
                    <div
                      className="d-flex justify-content-end gap-3 pt-3"
                      style={{ borderTop: "2px solid #f1f5f9" }}
                    >
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() =>
                          setDefaultPageId(staff?.default_page_id || 0)
                        }
                        style={{
                          borderRadius: "10px",
                          padding: "10px 24px",
                          fontWeight: "500",
                        }}
                      >
                        <i className="ri-refresh-line me-2"></i>
                        Reset
                      </button>
                      <button
                        className="btn"
                        onClick={handleSavePreferences}
                        disabled={
                          saving || defaultPageId === staff?.default_page_id
                        }
                        style={{
                          background:
                            "linear-gradient(135deg, #137547 0%, #0f5c38 100%)",
                          color: "white",
                          border: "none",
                          borderRadius: "10px",
                          padding: "10px 24px",
                          fontWeight: "600",
                          boxShadow: "0 4px 12px rgba(19, 117, 71, 0.25)",
                          opacity:
                            saving || defaultPageId === staff?.default_page_id
                              ? 0.6
                              : 1,
                        }}
                      >
                        {saving ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Saving...
                          </>
                        ) : (
                          <>
                            <i className="ri-save-line me-2"></i>
                            Save Preferences
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Activity Tab */}
                {activeTab === "activity" && (
                  <div
                    className="tab-content-section"
                    style={{ animation: "fadeIn 0.3s ease" }}
                  >
                    <div
                      className="mb-4 pb-3"
                      style={{ borderBottom: "2px solid #f1f5f9" }}
                    >
                      <h5
                        className="mb-1"
                        style={{
                          fontSize: "1.25rem",
                          fontWeight: "700",
                          color: "#1e293b",
                        }}
                      >
                        Activity Overview
                      </h5>
                      <p
                        className="text-muted mb-0"
                        style={{ fontSize: "0.9rem" }}
                      >
                        Your contributions and engagement metrics
                      </p>
                    </div>

                    <div className="row g-4 mb-4">
                      <div className="col-md-3">
                        <div
                          className="card border-0"
                          style={{
                            background:
                              "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
                            borderRadius: "16px",
                            boxShadow: "0 4px 12px rgba(19, 117, 71, 0.1)",
                            transition:
                              "transform 0.2s ease, box-shadow 0.2s ease",
                            cursor: "pointer",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform =
                              "translateY(-4px)";
                            e.currentTarget.style.boxShadow =
                              "0 8px 24px rgba(19, 117, 71, 0.15)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow =
                              "0 4px 12px rgba(19, 117, 71, 0.1)";
                          }}
                        >
                          <div className="card-body text-center p-4">
                            <div
                              style={{
                                width: "56px",
                                height: "56px",
                                borderRadius: "14px",
                                background:
                                  "linear-gradient(135deg, #137547 0%, #0f5c38 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 auto 1rem",
                                boxShadow: "0 4px 12px rgba(19, 117, 71, 0.25)",
                              }}
                            >
                              <i
                                className="ri-file-text-line"
                                style={{ fontSize: "1.75rem", color: "white" }}
                              ></i>
                            </div>
                            <h3
                              className="mb-1"
                              style={{
                                color: "#137547",
                                fontSize: "2rem",
                                fontWeight: "700",
                              }}
                            >
                              {staffData?.documentDrafts?.length || 0}
                            </h3>
                            <small
                              style={{
                                color: "#64748b",
                                fontWeight: "500",
                                fontSize: "0.85rem",
                              }}
                            >
                              Documents Created
                            </small>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div
                          className="card border-0"
                          style={{
                            background:
                              "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                            borderRadius: "16px",
                            boxShadow: "0 4px 12px rgba(59, 130, 246, 0.1)",
                            transition:
                              "transform 0.2s ease, box-shadow 0.2s ease",
                            cursor: "pointer",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform =
                              "translateY(-4px)";
                            e.currentTarget.style.boxShadow =
                              "0 8px 24px rgba(59, 130, 246, 0.15)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow =
                              "0 4px 12px rgba(59, 130, 246, 0.1)";
                          }}
                        >
                          <div className="card-body text-center p-4">
                            <div
                              style={{
                                width: "56px",
                                height: "56px",
                                borderRadius: "14px",
                                background:
                                  "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 auto 1rem",
                                boxShadow:
                                  "0 4px 12px rgba(59, 130, 246, 0.25)",
                              }}
                            >
                              <i
                                className="ri-file-check-line"
                                style={{ fontSize: "1.75rem", color: "white" }}
                              ></i>
                            </div>
                            <h3
                              className="mb-1"
                              style={{
                                color: "#3b82f6",
                                fontSize: "2rem",
                                fontWeight: "700",
                              }}
                            >
                              {staffData?.signed?.length || 0}
                            </h3>
                            <small
                              style={{
                                color: "#64748b",
                                fontWeight: "500",
                                fontSize: "0.85rem",
                              }}
                            >
                              Documents Signed
                            </small>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div
                          className="card border-0"
                          style={{
                            background:
                              "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
                            borderRadius: "16px",
                            boxShadow: "0 4px 12px rgba(245, 158, 11, 0.1)",
                            transition:
                              "transform 0.2s ease, box-shadow 0.2s ease",
                            cursor: "pointer",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform =
                              "translateY(-4px)";
                            e.currentTarget.style.boxShadow =
                              "0 8px 24px rgba(245, 158, 11, 0.15)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow =
                              "0 4px 12px rgba(245, 158, 11, 0.1)";
                          }}
                        >
                          <div className="card-body text-center p-4">
                            <div
                              style={{
                                width: "56px",
                                height: "56px",
                                borderRadius: "14px",
                                background:
                                  "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 auto 1rem",
                                boxShadow:
                                  "0 4px 12px rgba(245, 158, 11, 0.25)",
                              }}
                            >
                              <i
                                className="ri-money-dollar-circle-line"
                                style={{ fontSize: "1.75rem", color: "white" }}
                              ></i>
                            </div>
                            <h3
                              className="mb-1"
                              style={{
                                color: "#f59e0b",
                                fontSize: "2rem",
                                fontWeight: "700",
                              }}
                            >
                              {staffData?.claims?.length || 0}
                            </h3>
                            <small
                              style={{
                                color: "#64748b",
                                fontWeight: "500",
                                fontSize: "0.85rem",
                              }}
                            >
                              Claims Submitted
                            </small>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div
                          className="card border-0"
                          style={{
                            background:
                              "linear-gradient(135deg, #fae8ff 0%, #f3e8ff 100%)",
                            borderRadius: "16px",
                            boxShadow: "0 4px 12px rgba(168, 85, 247, 0.1)",
                            transition:
                              "transform 0.2s ease, box-shadow 0.2s ease",
                            cursor: "pointer",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform =
                              "translateY(-4px)";
                            e.currentTarget.style.boxShadow =
                              "0 8px 24px rgba(168, 85, 247, 0.15)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow =
                              "0 4px 12px rgba(168, 85, 247, 0.1)";
                          }}
                        >
                          <div className="card-body text-center p-4">
                            <div
                              style={{
                                width: "56px",
                                height: "56px",
                                borderRadius: "14px",
                                background:
                                  "linear-gradient(135deg, #a855f7 0%, #9333ea 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 auto 1rem",
                                boxShadow:
                                  "0 4px 12px rgba(168, 85, 247, 0.25)",
                              }}
                            >
                              <i
                                className="ri-calendar-event-line"
                                style={{ fontSize: "1.75rem", color: "white" }}
                              ></i>
                            </div>
                            <h3
                              className="mb-1"
                              style={{
                                color: "#a855f7",
                                fontSize: "2rem",
                                fontWeight: "700",
                              }}
                            >
                              {staffData?.meetings?.length || 0}
                            </h3>
                            <small
                              style={{
                                color: "#64748b",
                                fontWeight: "500",
                                fontSize: "0.85rem",
                              }}
                            >
                              Meetings Scheduled
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="alert alert-info">
                      <i className="ri-information-line me-2"></i>
                      <small>
                        Detailed activity logs and analytics will be available
                        in future updates.
                      </small>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
