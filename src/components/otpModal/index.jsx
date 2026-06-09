import React, { useState, useEffect, useRef } from "react";
import "./styles.scss";

const OTP_LENGTH = 6;

const OTPModal = ({ showModal, onClose, onSubmit, phone, loading = false }) => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  // Reset + focus whenever the modal opens.
  useEffect(() => {
    if (!showModal) return;
    setOtp("");
    setError("");
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, [showModal]);

  const handleChange = (e) => {
    setOtp(e.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH));
    if (error) setError("");
  };

  const submit = () => {
    if (otp.length === OTP_LENGTH) onSubmit(otp);
    else setError("Please enter the 6-digit OTP.");
  };

  if (!showModal) return null;

  return (
    <div className="otpOverlay" onClick={loading ? undefined : onClose}>
      <div
        className="otpModal"
        role="dialog"
        aria-modal="true"
        aria-label="Enter OTP"
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? (
          <div className="otpModal__loading">
            <span className="otpSpinner" aria-hidden="true" />
            <p>Verifying OTP…</p>
          </div>
        ) : (
          <>
            <div className="otpModal__icon" aria-hidden="true">🔐</div>
            <h2 className="otpModal__title">Enter OTP</h2>
            <p className="otpModal__sub">
              Sent to <strong>+91 {phone}</strong>
            </p>

            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={OTP_LENGTH}
              value={otp}
              onChange={handleChange}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="••••••"
              className={`otpInput ${error ? "otpInput--error" : ""}`}
              aria-label="6-digit OTP"
            />
            {error && <p className="otpModal__err">{error}</p>}

            <div className="otpModal__actions">
              <button type="button" className="otpBtn otpBtn--ghost" onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                className="otpBtn otpBtn--primary"
                onClick={submit}
                disabled={otp.length !== OTP_LENGTH}
              >
                Verify
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OTPModal;
