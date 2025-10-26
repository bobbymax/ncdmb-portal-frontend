import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { ApiService } from "app/Services/ApiService";

type SetupStep = "intro" | "generate" | "confirm" | "complete";

const TwoFactorSetup: React.FC = () => {
  const [step, setStep] = useState<SetupStep>("intro");
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const apiService = new ApiService();

  const generateQRCode = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiService.post("2fa/generate", {});
      setQrCodeUrl((response.data as any).qr_code_url);
      setSecret((response.data as any).secret);
      setStep("confirm");
    } catch (err: any) {
      setError(err.response?.data?.message || "Error generating 2FA");
    } finally {
      setLoading(false);
    }
  };

  const confirmSetup = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiService.post("2fa/confirm", { code });
      setRecoveryCodes((response.data as any).recovery_codes);
      setStep("complete");
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Invalid code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const copyRecoveryCodes = () => {
    const text = recoveryCodes.join("\n");
    navigator.clipboard.writeText(text);
    alert("Recovery codes copied to clipboard!");
  };

  return (
    <div className="two-factor-setup card">
      <div className="card-body">
        {step === "intro" && (
          <div className="text-center">
            <div className="mb-4">
              <i
                className="ri-shield-check-line"
                style={{ fontSize: "4rem", color: "#137547" }}
              ></i>
            </div>
            <h3>Secure Your Account with Microsoft Authenticator</h3>
            <p className="text-muted mb-4">
              Add an extra layer of security to your NCDMB Portal account using
              Microsoft Authenticator app
            </p>

            <div className="features mb-4">
              <div className="row g-3">
                <div className="col-md-4">
                  <i
                    className="ri-smartphone-line"
                    style={{ color: "#137547", fontSize: "2rem" }}
                  ></i>
                  <p className="small mt-2">Works on any smartphone</p>
                </div>
                <div className="col-md-4">
                  <i
                    className="ri-lock-line"
                    style={{ color: "#137547", fontSize: "2rem" }}
                  ></i>
                  <p className="small mt-2">Enhanced security</p>
                </div>
                <div className="col-md-4">
                  <i
                    className="ri-time-line"
                    style={{ color: "#137547", fontSize: "2rem" }}
                  ></i>
                  <p className="small mt-2">Quick verification</p>
                </div>
              </div>
            </div>

            <button
              className="btn btn-success btn-lg"
              onClick={() => {
                setStep("generate");
                generateQRCode();
              }}
              disabled={loading}
            >
              {loading ? "Setting up..." : "Get Started"}
            </button>

            <div className="mt-4">
              <a
                href="https://www.microsoft.com/en-us/security/mobile-authenticator-app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted small"
              >
                <i className="ri-download-line me-1"></i>
                Download Microsoft Authenticator
              </a>
            </div>
          </div>
        )}

        {step === "confirm" && (
          <div>
            <div className="text-center mb-4">
              <h3>Scan QR Code</h3>
              <p className="text-muted">Follow these steps:</p>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="setup-instructions">
                  <ol className="list-group list-group-numbered">
                    <li className="list-group-item d-flex align-items-start">
                      <div className="ms-2">
                        <strong>Open Microsoft Authenticator</strong>
                        <p className="mb-0 small text-muted">
                          On your smartphone
                        </p>
                      </div>
                    </li>
                    <li className="list-group-item d-flex align-items-start">
                      <div className="ms-2">
                        <strong>Tap the + button</strong>
                        <p className="mb-0 small text-muted">
                          Usually at top right
                        </p>
                      </div>
                    </li>
                    <li className="list-group-item d-flex align-items-start">
                      <div className="ms-2">
                        <strong>Select &quot;Other account&quot;</strong>
                        <p className="mb-0 small text-muted">
                          Or &quot;Work or school account&quot;
                        </p>
                      </div>
                    </li>
                    <li className="list-group-item d-flex align-items-start">
                      <div className="ms-2">
                        <strong>Scan this QR code</strong>
                        <p className="mb-0 small text-muted">
                          Point your camera at the code
                        </p>
                      </div>
                    </li>
                  </ol>
                </div>
              </div>

              <div className="col-md-6 text-center">
                <div className="p-3 bg-light rounded">
                  {qrCodeUrl && (
                    <QRCodeSVG
                      value={qrCodeUrl}
                      size={220}
                      level="H"
                      includeMargin={true}
                    />
                  )}
                </div>

                <div className="mt-3">
                  <details>
                    <summary
                      className="text-muted small"
                      style={{ cursor: "pointer" }}
                    >
                      Can&apos;t scan? Enter manually
                    </summary>
                    <div className="mt-2 p-2 bg-light rounded">
                      <small>
                        Account: <strong>NCDMB Portal</strong>
                      </small>
                      <br />
                      <small>
                        Key: <code className="user-select-all">{secret}</code>
                      </small>
                    </div>
                  </details>
                </div>
              </div>
            </div>

            {error && <div className="alert alert-danger mt-3">{error}</div>}

            <div className="mt-4">
              <label className="form-label">
                Enter the 6-digit code from Microsoft Authenticator:
              </label>
              <input
                type="text"
                className="form-control form-control-lg text-center"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                maxLength={6}
                style={{ fontSize: "1.5rem", letterSpacing: "0.5rem" }}
              />
              <button
                className="btn btn-success w-100 mt-3"
                onClick={confirmSetup}
                disabled={loading || code.length !== 6}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Verifying...
                  </>
                ) : (
                  "Verify & Enable 2FA"
                )}
              </button>
            </div>
          </div>
        )}

        {step === "complete" && (
          <div className="text-center">
            <div className="mb-4">
              <i
                className="ri-checkbox-circle-line text-success"
                style={{ fontSize: "4rem" }}
              ></i>
            </div>
            <h3 className="text-success">2FA Enabled Successfully!</h3>
            <p className="text-muted mb-4">
              Your account is now protected with two-factor authentication
            </p>

            <div className="alert alert-warning text-start">
              <h5 className="alert-heading">
                <i className="ri-key-line me-2"></i>
                Save Your Recovery Codes
              </h5>
              <p className="mb-3">
                Store these codes in a safe place. You can use them to access
                your account if you lose access to Microsoft Authenticator.
              </p>
              <div className="row g-2 mb-3">
                {recoveryCodes.map((recoveryCode, idx) => (
                  <div key={idx} className="col-6">
                    <code className="d-block p-2 bg-light rounded text-center">
                      {recoveryCode}
                    </code>
                  </div>
                ))}
              </div>
              <button
                className="btn btn-sm btn-outline-warning"
                onClick={copyRecoveryCodes}
              >
                <i className="ri-file-copy-line me-1"></i>
                Copy All Codes
              </button>
            </div>

            <button
              className="btn btn-success btn-lg"
              onClick={() => window.location.reload()}
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TwoFactorSetup;
