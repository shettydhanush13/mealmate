import { useState } from "react";
import { sendOTP, verifyOTP } from "../../services/otp";
import { checkIsAdmin, fetchAdminProfile } from "../../services/admins";
import "../requireAdmin/styles.scss";

/**
 * Shared OTP login form for admins and vendors.
 * Props:
 *  - brand: heading text under the card (e.g. "CaterKart Admin")
 *  - subtitle: small line under the title
 *  - onAuthed(profile): called with the verified admin profile on success
 *  - requireType: optional 'vendor' | 'admin' — restrict who may log in here
 */
export default function LoginForm({ brand, subtitle, onAuthed, requireType }) {
  const [step, setStep] = useState("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const notAllowed = "This number isn't registered. Contact CaterKart to get access.";

  const sendCode = async (e) => {
    e.preventDefault();
    const num = phone.trim();
    if (!/^\d{10}$/.test(num)) { setError("Enter a valid 10-digit phone number."); return; }
    setError(""); setBusy(true);
    try {
      const ok = await checkIsAdmin(num);
      if (!ok) { setError(notAllowed); return; }
      await sendOTP(num);
      setOtp(""); setStep("otp");
    } catch (err) {
      setError(err?.response?.data?.message || "Couldn't send the OTP. Please try again.");
    } finally { setBusy(false); }
  };

  const verifyCode = async (e) => {
    e.preventDefault();
    const code = otp.trim();
    if (code.length < 4) { setError("Enter the code we sent you."); return; }
    setError(""); setBusy(true);
    try {
      const res = await verifyOTP(phone.trim(), code);
      const status = res?.status ?? res;
      if (status !== "approved") { setError("Incorrect or expired code. Please try again."); return; }
      const profile = await fetchAdminProfile(phone.trim());
      if (!profile?.isAdmin) { setError(notAllowed); return; }
      if (requireType && profile.type !== requireType) {
        setError(requireType === "vendor"
          ? "This is the vendor login. Please use the admin login."
          : "This is the admin login. Please use the vendor login.");
        return;
      }
      onAuthed(profile);
    } catch (err) {
      setError(err?.response?.data?.message || "Verification failed. Please try again.");
    } finally { setBusy(false); }
  };

  return (
    <div className="admin-gate__card">
      <div className="admin-gate__brand">{brand}</div>

      {step === "phone" ? (
        <form onSubmit={sendCode} className="admin-gate__form">
          <h1 className="admin-gate__title">Sign in to continue</h1>
          <p className="admin-gate__sub">{subtitle}</p>

          <label className="admin-gate__label">
            Phone number
            <div className="admin-gate__phone">
              <span className="admin-gate__cc">+91</span>
              <input
                type="tel" inputMode="numeric" autoComplete="tel" maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                placeholder="10-digit number" autoFocus
              />
            </div>
          </label>

          {error && <div className="admin-gate__error">{error}</div>}
          <button type="submit" className="admin-gate__btn" disabled={busy}>{busy ? "Sending…" : "Send OTP"}</button>
        </form>
      ) : (
        <form onSubmit={verifyCode} className="admin-gate__form">
          <h1 className="admin-gate__title">Enter OTP</h1>
          <p className="admin-gate__sub">We sent a code to <strong>+91 {phone}</strong>.</p>

          <label className="admin-gate__label">
            One-time password
            <input
              className="admin-gate__otp" type="text" inputMode="numeric" maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="••••••" autoFocus
            />
          </label>

          {error && <div className="admin-gate__error">{error}</div>}
          <button type="submit" className="admin-gate__btn" disabled={busy}>{busy ? "Verifying…" : "Verify & continue"}</button>
          <button type="button" className="admin-gate__link" onClick={() => { setStep("phone"); setOtp(""); setError(""); }}>
            Change number
          </button>
        </form>
      )}
    </div>
  );
}
