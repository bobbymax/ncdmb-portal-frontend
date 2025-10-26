import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "app/Context/AuthContext";
import TwoFactorSetup from "../components/Auth/TwoFactorSetup";
import { ApiService } from "app/Services/ApiService";
import Alert from "app/Support/Alert";
import "resources/assets/css/security-settings.css";

const SecuritySettings = () => {
  const { staff } = useAuth();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDisablePassword, setShowDisablePassword] = useState(false);
  const [password, setPassword] = useState("");
  const [disabling, setDisabling] = useState(false);

  // Memoize API service instance
  const apiService = useMemo(() => new ApiService(), []);

  // Check 2FA status on mount
  useEffect(() => {
    const check2FAStatus = async () => {
      try {
        const response = await apiService.get("2fa/status");
        setTwoFactorEnabled((response.data as any).enabled);
      } catch (error) {
        console.error("Error checking 2FA status:", error);
      } finally {
        setLoading(false);
      }
    };

    check2FAStatus();
  }, []);

  const handleDisable2FA = async () => {
    if (!password) {
      Alert.error(
        "Password Required",
        "Please enter your password to disable 2FA"
      );
      return;
    }

    setDisabling(true);
    try {
      const response = await apiService.post("2fa/disable", { password });
      Alert.success("2FA Disabled", (response.data as any).message);
      setTwoFactorEnabled(false);
      setShowDisablePassword(false);
      setPassword("");
    } catch (error: any) {
      Alert.error(
        "Error",
        error.response?.data?.message || "Failed to disable 2FA"
      );
    } finally {
      setDisabling(false);
    }
  };

  return (
    <div
      className="security-settings-page"
      style={{
        background: "var(--bg-primary, #f8f9fa)",
        minHeight: "100%",
        paddingBottom: "2rem",
      }}
    >
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            {/* Two-Factor Authentication Section */}
            <div
              className="card border-0 mb-4"
              style={{
                borderRadius: "16px",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                overflow: "hidden",
              }}
            >
              <div
                className="card-header border-0"
                style={{
                  background: twoFactorEnabled
                    ? "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)"
                    : "linear-gradient(135deg, #137547 0%, #0f5c38 100%)",
                  padding: "2rem",
                  borderRadius: "16px 16px 0 0",
                }}
              >
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h2
                      className="mb-2"
                      style={{
                        fontSize: "1.75rem",
                        fontWeight: "700",
                        color: "white",
                        letterSpacing: "-0.5px",
                      }}
                    >
                      <i
                        className={
                          twoFactorEnabled
                            ? "ri-shield-check-fill me-3"
                            : "ri-shield-line me-3"
                        }
                      ></i>
                      Two-Factor Authentication
                    </h2>
                    <p
                      className="mb-0"
                      style={{
                        fontSize: "1rem",
                        color: "rgba(255, 255, 255, 0.9)",
                      }}
                    >
                      {twoFactorEnabled
                        ? "Your account is protected with Microsoft Authenticator"
                        : "Add an extra layer of security to your account"}
                    </p>
                  </div>
                  {twoFactorEnabled && (
                    <span
                      className="badge"
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.25)",
                        backdropFilter: "blur(10px)",
                        color: "white",
                        fontSize: "0.9rem",
                        padding: "10px 18px",
                        fontWeight: "600",
                        border: "2px solid rgba(255, 255, 255, 0.3)",
                        borderRadius: "10px",
                      }}
                    >
                      <i className="ri-checkbox-circle-fill me-2"></i>
                      Active
                    </span>
                  )}
                </div>
              </div>
              <div className="card-body" style={{ padding: "2rem" }}>
                {loading ? (
                  <div className="text-center py-5">
                    <div
                      style={{
                        width: "64px",
                        height: "64px",
                        margin: "0 auto 1.5rem",
                        borderRadius: "50%",
                        background:
                          "linear-gradient(135deg, #137547 0%, #0f5c38 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 8px 24px rgba(19, 117, 71, 0.2)",
                      }}
                    >
                      <div
                        className="spinner-border"
                        role="status"
                        style={{
                          color: "white",
                          width: "32px",
                          height: "32px",
                        }}
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                    <p
                      className="text-muted mb-0"
                      style={{ fontSize: "1rem", fontWeight: "500" }}
                    >
                      Checking security status...
                    </p>
                  </div>
                ) : twoFactorEnabled ? (
                  <div style={{ animation: "fadeIn 0.3s ease" }}>
                    <div
                      className="p-4 mb-4 border-0"
                      style={{
                        background:
                          "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
                        borderRadius: "14px",
                        border: "2px solid #6ee7b7",
                      }}
                    >
                      <div className="d-flex align-items-start gap-3">
                        <div
                          style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "12px",
                            background:
                              "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            boxShadow: "0 4px 12px rgba(34, 197, 94, 0.25)",
                          }}
                        >
                          <i
                            className="ri-shield-check-fill"
                            style={{ fontSize: "1.5rem", color: "white" }}
                          ></i>
                        </div>
                        <div className="flex-grow-1">
                          <h6
                            className="mb-2"
                            style={{
                              fontSize: "1.1rem",
                              fontWeight: "700",
                              color: "#065f46",
                            }}
                          >
                            2FA is Active & Protecting Your Account
                          </h6>
                          <p
                            className="mb-2"
                            style={{
                              color: "#047857",
                              fontSize: "0.95rem",
                              lineHeight: "1.6",
                            }}
                          >
                            Your account is secured with Microsoft
                            Authenticator. You&apos;ll need to enter a
                            verification code from your app when signing in.
                          </p>
                          <div className="d-flex align-items-center gap-2 mt-3">
                            <div
                              style={{
                                padding: "6px 12px",
                                background: "rgba(255, 255, 255, 0.6)",
                                borderRadius: "8px",
                                fontSize: "0.85rem",
                                fontWeight: "600",
                                color: "#065f46",
                              }}
                            >
                              <i className="ri-user-line me-1"></i>
                              {staff?.name}
                            </div>
                            <div
                              style={{
                                padding: "6px 12px",
                                background: "rgba(255, 255, 255, 0.6)",
                                borderRadius: "8px",
                                fontSize: "0.85rem",
                                fontWeight: "600",
                                color: "#065f46",
                              }}
                            >
                              <i className="ri-mail-line me-1"></i>
                              {staff?.email || staff?.staff_no}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {!showDisablePassword ? (
                      <div
                        className="text-center pt-3"
                        style={{ borderTop: "2px solid #f1f5f9" }}
                      >
                        <button
                          className="btn"
                          onClick={() => setShowDisablePassword(true)}
                          style={{
                            background: "transparent",
                            color: "#dc2626",
                            border: "2px solid #dc2626",
                            borderRadius: "10px",
                            padding: "10px 24px",
                            fontWeight: "600",
                            transition: "all 0.3s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#dc2626";
                            e.currentTarget.style.color = "white";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color = "#dc2626";
                          }}
                        >
                          <i className="ri-shield-cross-line me-2"></i>
                          Disable Two-Factor Authentication
                        </button>
                        <p
                          className="text-muted small mt-3 mb-0"
                          style={{ fontSize: "0.85rem" }}
                        >
                          <i className="ri-error-warning-line me-1"></i>
                          This will remove the extra security layer from your
                          account
                        </p>
                      </div>
                    ) : (
                      <div
                        className="p-4 mt-4"
                        style={{
                          background: "#fef2f2",
                          borderRadius: "14px",
                          border: "2px solid #fecaca",
                        }}
                      >
                        <div
                          className="d-flex align-items-start gap-3 mb-4 p-3"
                          style={{
                            background: "#fee2e2",
                            borderRadius: "10px",
                          }}
                        >
                          <i
                            className="ri-error-warning-fill"
                            style={{
                              fontSize: "1.5rem",
                              color: "#dc2626",
                              marginTop: "2px",
                            }}
                          ></i>
                          <div>
                            <strong
                              style={{ color: "#991b1b", fontSize: "0.95rem" }}
                            >
                              Security Warning
                            </strong>
                            <p
                              className="mb-0 mt-1"
                              style={{ color: "#b91c1c", fontSize: "0.9rem" }}
                            >
                              Disabling two-factor authentication will make your
                              account vulnerable. Are you sure you want to
                              proceed?
                            </p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <label
                            className="form-label mb-2"
                            style={{ fontWeight: "600", color: "#1e293b" }}
                          >
                            <i
                              className="ri-lock-password-line me-2"
                              style={{ color: "#dc2626" }}
                            ></i>
                            Confirm Your Password
                          </label>
                          <input
                            type="password"
                            className="form-control"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === "Enter" && password) {
                                handleDisable2FA();
                              }
                            }}
                            style={{
                              borderRadius: "10px",
                              border: "2px solid #fca5a5",
                              padding: "12px 16px",
                              fontSize: "0.95rem",
                            }}
                          />
                        </div>

                        <div className="d-flex gap-3 justify-content-end">
                          <button
                            className="btn btn-outline-secondary"
                            onClick={() => {
                              setShowDisablePassword(false);
                              setPassword("");
                            }}
                            disabled={disabling}
                            style={{
                              borderRadius: "10px",
                              padding: "10px 24px",
                              fontWeight: "500",
                            }}
                          >
                            <i className="ri-arrow-left-line me-2"></i>
                            Cancel
                          </button>
                          <button
                            className="btn"
                            onClick={handleDisable2FA}
                            disabled={!password || disabling}
                            style={{
                              background:
                                "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                              color: "white",
                              border: "none",
                              borderRadius: "10px",
                              padding: "10px 24px",
                              fontWeight: "600",
                              boxShadow: "0 4px 12px rgba(220, 38, 38, 0.25)",
                              opacity: !password || disabling ? 0.6 : 1,
                            }}
                          >
                            {disabling ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Disabling...
                              </>
                            ) : (
                              <>
                                <i className="ri-close-circle-line me-2"></i>
                                Confirm Disable 2FA
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ animation: "fadeIn 0.3s ease" }}>
                    <div
                      className="p-4 mb-4 border-0"
                      style={{
                        background:
                          "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                        borderRadius: "14px",
                        border: "2px solid #93c5fd",
                      }}
                    >
                      <div className="d-flex align-items-start gap-3">
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
                            flexShrink: 0,
                            boxShadow: "0 4px 12px rgba(59, 130, 246, 0.25)",
                          }}
                        >
                          <i
                            className="ri-shield-line"
                            style={{ fontSize: "1.5rem", color: "white" }}
                          ></i>
                        </div>
                        <div className="flex-grow-1">
                          <h6
                            className="mb-2"
                            style={{
                              fontSize: "1.1rem",
                              fontWeight: "700",
                              color: "#1e40af",
                            }}
                          >
                            Enhance Your Security with 2FA
                          </h6>
                          <p
                            className="mb-0"
                            style={{
                              color: "#1e3a8a",
                              fontSize: "0.95rem",
                              lineHeight: "1.6",
                            }}
                          >
                            Protect your account by enabling two-factor
                            authentication. You&apos;ll use the Microsoft
                            Authenticator app to verify your identity when
                            signing in.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* TwoFactorSetup Component */}
                    <TwoFactorSetup />
                  </div>
                )}
              </div>
            </div>
            {/* Additional Security Information */}
            <div
              className="card border-0"
              style={{
                borderRadius: "16px",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
              }}
            >
              <div
                className="card-header border-0 bg-white"
                style={{ borderRadius: "16px 16px 0 0", padding: "1.5rem" }}
              >
                <div className="d-flex align-items-center gap-3">
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
                      className="ri-lightbulb-line"
                      style={{ fontSize: "1.5rem", color: "white" }}
                    ></i>
                  </div>
                  <div>
                    <h5
                      className="mb-0"
                      style={{
                        fontSize: "1.15rem",
                        fontWeight: "700",
                        color: "#1e293b",
                      }}
                    >
                      Security Best Practices
                    </h5>
                    <p className="text-muted mb-0 small">
                      Keep your account safe with these tips
                    </p>
                  </div>
                </div>
              </div>
              <div className="card-body" style={{ padding: "1.5rem" }}>
                <div className="row g-4">
                  <div className="col-md-6">
                    <div
                      className="p-3 h-100"
                      style={{
                        background:
                          "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
                        borderRadius: "12px",
                        border: "2px solid #fde68a",
                      }}
                    >
                      <div className="d-flex gap-3">
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "10px",
                            background:
                              "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            boxShadow: "0 4px 12px rgba(245, 158, 11, 0.2)",
                          }}
                        >
                          <i
                            className="ri-lock-password-line"
                            style={{ color: "white", fontSize: "1.25rem" }}
                          ></i>
                        </div>
                        <div>
                          <h6
                            className="mb-1"
                            style={{
                              fontSize: "0.95rem",
                              fontWeight: "700",
                              color: "#92400e",
                            }}
                          >
                            Use Strong Passwords
                          </h6>
                          <p
                            className="mb-0"
                            style={{ fontSize: "0.85rem", color: "#78350f" }}
                          >
                            Use a combination of letters, numbers, and symbols
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div
                      className="p-3 h-100"
                      style={{
                        background:
                          "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                        borderRadius: "12px",
                        border: "2px solid #93c5fd",
                      }}
                    >
                      <div className="d-flex gap-3">
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "10px",
                            background:
                              "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            boxShadow: "0 4px 12px rgba(59, 130, 246, 0.2)",
                          }}
                        >
                          <i
                            className="ri-smartphone-line"
                            style={{ color: "white", fontSize: "1.25rem" }}
                          ></i>
                        </div>
                        <div>
                          <h6
                            className="mb-1"
                            style={{
                              fontSize: "0.95rem",
                              fontWeight: "700",
                              color: "#1e40af",
                            }}
                          >
                            Keep Your Phone Secure
                          </h6>
                          <p
                            className="mb-0"
                            style={{ fontSize: "0.85rem", color: "#1e3a8a" }}
                          >
                            Enable biometric unlock on your authenticator app
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div
                      className="p-3 h-100"
                      style={{
                        background:
                          "linear-gradient(135deg, #fae8ff 0%, #f3e8ff 100%)",
                        borderRadius: "12px",
                        border: "2px solid #e9d5ff",
                      }}
                    >
                      <div className="d-flex gap-3">
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "10px",
                            background:
                              "linear-gradient(135deg, #a855f7 0%, #9333ea 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            boxShadow: "0 4px 12px rgba(168, 85, 247, 0.2)",
                          }}
                        >
                          <i
                            className="ri-key-line"
                            style={{ color: "white", fontSize: "1.25rem" }}
                          ></i>
                        </div>
                        <div>
                          <h6
                            className="mb-1"
                            style={{
                              fontSize: "0.95rem",
                              fontWeight: "700",
                              color: "#6b21a8",
                            }}
                          >
                            Save Recovery Codes
                          </h6>
                          <p
                            className="mb-0"
                            style={{ fontSize: "0.85rem", color: "#581c87" }}
                          >
                            Store them safely in case you lose your device
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div
                      className="p-3 h-100"
                      style={{
                        background:
                          "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
                        borderRadius: "12px",
                        border: "2px solid #6ee7b7",
                      }}
                    >
                      <div className="d-flex gap-3">
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "10px",
                            background:
                              "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            boxShadow: "0 4px 12px rgba(34, 197, 94, 0.2)",
                          }}
                        >
                          <i
                            className="ri-file-shield-line"
                            style={{ color: "white", fontSize: "1.25rem" }}
                          ></i>
                        </div>
                        <div>
                          <h6
                            className="mb-1"
                            style={{
                              fontSize: "0.95rem",
                              fontWeight: "700",
                              color: "#065f46",
                            }}
                          >
                            Regular Security Checks
                          </h6>
                          <p
                            className="mb-0"
                            style={{ fontSize: "0.85rem", color: "#047857" }}
                          >
                            Review your account activity periodically
                          </p>
                        </div>
                      </div>
                    </div>
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

export default SecuritySettings;
