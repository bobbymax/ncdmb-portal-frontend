import React, { useState, useEffect } from "react";
import { ApiService } from "app/Services/ApiService";

interface TwoFactorChallengeProps {
  userId: number;
  onSuccess: () => void;
  onCancel?: () => void;
}

const TwoFactorChallenge: React.FC<TwoFactorChallengeProps> = ({
  userId,
  onSuccess,
  onCancel,
}) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [useRecoveryCode, setUseRecoveryCode] = useState(false);
  const apiService = new ApiService();

  // Auto-focus input on mount
  useEffect(() => {
    const input = document.getElementById("2fa-code-input");
    if (input) {
      input.focus();
    }
  }, [useRecoveryCode]);

  const handleVerify = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiService.post("2fa/verify", {
        user_id: userId,
        code: code.toUpperCase(),
      });

      const data = response.data as any;

      // Show success message if recovery code was used
      if (data.recovery_codes_remaining !== undefined) {
        alert(
          `${data.message}\nRecovery codes remaining: ${data.recovery_codes_remaining}`
        );
      }

      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && code.length >= (useRecoveryCode ? 10 : 6)) {
      handleVerify();
    }
  };

  return (
    <div className="two-factor-challenge">
      <div className="card" style={{ maxWidth: 450, margin: "50px auto" }}>
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <div className="mb-3">
              <i
                className="ri-shield-check-line"
                style={{ fontSize: "3rem", color: "#137547" }}
              ></i>
            </div>
            <h3 className="mb-2">Two-Factor Authentication</h3>
            <p className="text-muted small">
              {useRecoveryCode
                ? "Enter one of your recovery codes"
                : "Open Microsoft Authenticator and enter the 6-digit code"}
            </p>
          </div>

          {error && (
            <div className="alert alert-danger py-2">
              <i className="ri-error-warning-line me-2"></i>
              {error}
            </div>
          )}

          <div className="mb-3">
            <input
              id="2fa-code-input"
              type="text"
              className="form-control form-control-lg text-center"
              placeholder={useRecoveryCode ? "RECOVERY-CODE" : "000000"}
              value={code}
              onChange={(e) =>
                setCode(
                  e.target.value.replace(
                    useRecoveryCode ? /[^A-Z0-9-]/g : /\D/g,
                    ""
                  )
                )
              }
              onKeyPress={handleKeyPress}
              maxLength={useRecoveryCode ? 12 : 6}
              style={{
                fontSize: "1.5rem",
                letterSpacing: useRecoveryCode ? "0.1rem" : "0.5rem",
                fontFamily: "monospace",
              }}
              disabled={loading}
            />
            <small className="text-muted d-block mt-1">
              {useRecoveryCode
                ? "Recovery codes are case-insensitive"
                : "The code refreshes every 30 seconds"}
            </small>
          </div>

          <button
            className="btn btn-success btn-lg w-100 mb-3"
            onClick={handleVerify}
            disabled={loading || code.length < (useRecoveryCode ? 10 : 6)}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Verifying...
              </>
            ) : (
              <>
                <i className="ri-check-line me-2"></i>
                Verify
              </>
            )}
          </button>

          <div className="d-flex justify-content-between align-items-center">
            <button
              className="btn btn-link p-0 text-decoration-none"
              onClick={() => {
                setUseRecoveryCode(!useRecoveryCode);
                setCode("");
                setError("");
              }}
              disabled={loading}
            >
              <small>
                {useRecoveryCode
                  ? "← Use authenticator code"
                  : "Use recovery code →"}
              </small>
            </button>

            {onCancel && (
              <button
                className="btn btn-link p-0 text-muted text-decoration-none"
                onClick={onCancel}
                disabled={loading}
              >
                <small>Cancel</small>
              </button>
            )}
          </div>

          <div className="mt-4 p-3 bg-light rounded">
            <small className="text-muted">
              <i className="ri-information-line me-1"></i>
              <strong>Need help?</strong> If you&apos;ve lost access to your
              authenticator app, use one of your recovery codes to sign in.
              Contact IT support if you need assistance.
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorChallenge;
