import React, { useState } from "react";
import "./styles.scss"; // Add your styles here

const OTPModal = ({ showModal, onClose, onSubmit, phone }) => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 6) {
      setOtp(value);
      setError("");
    }
  };

  const handleSubmit = () => {
    if (otp.length === 6) {
      onSubmit(otp);
      setOtp("");
    } else {
      setError("Please enter a valid 6-digit OTP.");
    }
  };

  if (!showModal) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2>Enter OTP</h2>
        <h4>OTP has been sent to {phone}</h4>
        <input
          type="text"
          value={otp}
          onChange={handleChange}
          placeholder="Enter 6-digit OTP"
          className="otp-input"
        />
        {error && <p className="error-text">{error}</p>}
        <div className="modal-actions">
          <button onClick={onClose} className="btn-cancel">Cancel</button>
          <button onClick={handleSubmit} className="btn-submit">Submit</button>
        </div>
      </div>
    </div>
  );
};

export default OTPModal;