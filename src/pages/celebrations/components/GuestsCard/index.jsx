// src/pages/celebrations/components/GuestsCard/index.jsx
import React, { useEffect, useState } from "react";
import { FaLocationDot } from "react-icons/fa6";
import { FaCheckCircle, FaTimes } from "react-icons/fa";
import { HiOutlineUserGroup } from "react-icons/hi2";
import { checkServiceability } from "../../../../services/pincodes";
import "./styles.scss";

const MIN = 30;
const MAX = 500;
const STEP = 10;

const GuestsCard = ({ guests, pincode, onChange, onPincodeChange, error, pincodeError, onServiceability }) => {
  // inline serviceability feedback as the pincode is typed
  const [svc, setSvc] = useState({ status: "idle" }); // idle | checking | ok | no
  useEffect(() => {
    const p = String(pincode || "").replace(/\D/g, "");
    if (p.length !== 6) { setSvc({ status: "idle" }); return; }
    let active = true;
    setSvc({ status: "checking" });
    const t = setTimeout(async () => {
      try {
        const r = await checkServiceability(p);
        if (!active) return;
        onServiceability?.(r);
        if (r.notConfigured) setSvc({ status: "idle" });
        else if (r.serviceable) setSvc({ status: "ok", area: r.area });
        else setSvc({ status: "no" });
      } catch {
        if (active) setSvc({ status: "idle" });
      }
    }, 400);
    return () => { active = false; clearTimeout(t); };
  }, [pincode, onServiceability]);

  // stepper helpers — reuse the parent's onChange contract (reads e.target.value)
  const emit = (value) => onChange({ target: { value: String(value) } });
  const current = Number(guests) || 0;
  const dec = () => emit(Math.max(MIN, current - STEP));
  const inc = () => emit(Math.min(MAX, current + STEP));

  return (
    <section className="guestsCard">
      {/* Pincode / location */}
      <div className={`gcField ${pincodeError ? "has-error" : ""}`}>
        <span className="gcIcon" aria-hidden="true"><FaLocationDot /></span>
        <div className="gcFieldBody">
          <label htmlFor="pincodeInput" className="gcLabel">Delivery pincode</label>
          <input
            id="pincodeInput"
            name="pincode"
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={pincode}
            onChange={onPincodeChange}
            placeholder="e.g. 560001"
            className="gcInput"
          />
          {svc.status === "checking" && <span className="gcSvc gcSvc--checking">Checking availability…</span>}
          {svc.status === "ok" && <span className="gcSvc gcSvc--ok"><FaCheckCircle /> We deliver here{svc.area ? ` · ${svc.area}` : ""}</span>}
          {svc.status === "no" && <span className="gcSvc gcSvc--no"><FaTimes /> Sorry, we don't deliver to this pincode yet</span>}
        </div>
      </div>

      {/* Guests with stepper */}
      <div className={`gcField gcField--guests ${error ? "has-error" : ""}`}>
        <span className="gcIcon gcIcon--guests" aria-hidden="true"><HiOutlineUserGroup /></span>
        <div className="gcFieldBody">
          <label htmlFor="guestsInput" className="gcLabel">Number of guests</label>
          <div className="gcStepper">
            <button type="button" className="gcStepBtn" onClick={dec} aria-label="Decrease guests" disabled={current <= MIN}>−</button>
            <input
              id="guestsInput"
              type="number"
              min={MIN}
              max={MAX}
              value={guests}
              onChange={onChange}
              className="gcInput gcInput--num"
            />
            <button type="button" className="gcStepBtn" onClick={inc} aria-label="Increase guests" disabled={current >= MAX}>+</button>
          </div>
        </div>
      </div>

      {/* messages */}
      {(error || pincodeError) && (
        <div className="gcMessages">
          {pincodeError && <span className="errorText">{pincodeError}</span>}
          {error && <span className="errorText">{error}</span>}
        </div>
      )}
      {!error && !pincodeError && (
        <div className="guestsHelper">Minimum {MIN} – Maximum {MAX} guests</div>
      )}
    </section>
  );
};

export default GuestsCard;
