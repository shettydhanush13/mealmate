// src/pages/create-menu/components/ConfigModal.jsx
import React, { useState, useEffect } from "react";

/**
 * ConfigModal (full-page)
 *
 * - All fields mandatory.
 * - vegGuests + nonVegGuests MUST equal guestsFromRoute (when guestsFromRoute is provided).
 * - kidsCount is separate and NOT part of the veg+non-veg sum.
 * - If dietMode === "veg-only" and guestsFromRoute is provided, vegGuests is prefilled with guestsFromRoute and nonVegGuests is set to "0".
 *
 * Props:
 * - show, initial, guestsFromRoute, onSave
 */
const ConfigModal = ({ show, initial = {}, guestsFromRoute = null, onSave }) => {
  const [dietMode, setDietMode] = useState(initial.dietMode || "veg-only");
  const [vegGuests, setVegGuests] = useState(initial.vegGuests ?? "");
  const [nonVegGuests, setNonVegGuests] = useState(initial.nonVegGuests ?? "");
  const [kidsCount, setKidsCount] = useState(initial.kidsCount ?? "");
  const [eventTime, setEventTime] = useState(initial.eventTime || "");
  const [errors, setErrors] = useState({});

  // Compute the minimum allowed event datetime: exactly 7 days from now.
  // Return both the Date object and a string suitable for `input[type="datetime-local"].min`
  const getMinEventDateTime = () => {
    const now = new Date();
    const minDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 days
    // Round minutes to next 5-min increment? keep it exact to current time.
    const pad = (n) => (n < 10 ? `0${n}` : String(n));
    const yyyy = minDate.getFullYear();
    const mm = pad(minDate.getMonth() + 1);
    const dd = pad(minDate.getDate());
    const hh = '00';
    const min = '00';
    // datetime-local expects "YYYY-MM-DDTHH:MM"
    const minStr = `${yyyy}-${mm}-${dd}T${hh}:${min}`;
    return { minDate, minStr };
  };

  // Sync incoming initial when opened
  useEffect(() => {
    if (show) {
      setDietMode(initial.dietMode || "veg-only");

      // prefer provided initial values; otherwise blank
      setVegGuests(initial.vegGuests ?? "");
      setNonVegGuests(initial.nonVegGuests ?? "");
      setKidsCount(initial.kidsCount ?? "");
      setEventTime(initial.eventTime || "");
      setErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, initial]);

  // When dietMode flips to veg-only, automatically set nonVeg to 0 and (if available) prefill veg with total guests
  useEffect(() => {
    if (dietMode === "veg-only") {
      setNonVegGuests("0");
      if (typeof guestsFromRoute === "number") {
        setVegGuests(String(guestsFromRoute));
      }
    }
  }, [dietMode, guestsFromRoute]);

  const isPositiveInteger = (val) => {
    const n = Number(val);
    return Number.isInteger(n) && n >= 0;
  };

  const validate = () => {
    const errs = {};

    // vegGuests required
    if (vegGuests === "" || !isPositiveInteger(vegGuests)) {
      errs.vegGuests = "Enter a valid number of veg guests (0 or more)";
    }

    // nonVegGuests required (unless veg-only -> value forced to "0")
    if (dietMode === "veg+nonveg") {
      if (nonVegGuests === "" || !isPositiveInteger(nonVegGuests)) {
        errs.nonVegGuests = "Enter a valid number of non-veg guests (0 or more)";
      }
    } else {
      // veg-only, ensure nonVegGuests is numeric 0
      if (!isPositiveInteger(nonVegGuests)) {
        setNonVegGuests("0");
      }
    }

    // kidsCount required (separate from veg+nonveg)
    if (kidsCount === "" || !isPositiveInteger(kidsCount)) {
      errs.kidsCount = "Enter a valid number of kids (0 if none)";
    }

    // eventTime required and must be at least 7 days in future
    const { minDate, minStr } = getMinEventDateTime();
    if (!eventTime) {
      errs.eventTime = `Please select event date & time (must be on or after ${minStr.replace("T", " ")})`;
    } else {
      const dt = new Date(eventTime);
      if (isNaN(dt.getTime())) {
        errs.eventTime = "Invalid date/time";
      } else {
        // compare using milliseconds
        if (dt.getTime() < minDate.getTime()) {
          errs.eventTime = `Event must be at least 7 days from now (on or after ${minStr.replace("T", " ")}).`;
        }
      }
    }

    // enforce veg + nonveg matching guestsFromRoute when route-provided
    if (typeof guestsFromRoute === "number") {
      const v = Number(vegGuests || 0);
      const nv = Number(nonVegGuests || 0);
      if (!Number.isInteger(v) || !Number.isInteger(nv)) {
        errs.sum = "Veg and Non-Veg counts must be integers";
      } else if (v + nv !== Number(guestsFromRoute)) {
        errs.sum = `Veg + Non-Veg (currently ${v + nv}) must equal total guests (${guestsFromRoute}). Kids are entered separately.`;
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Return values to parent. Keep same shape (strings) for backward compatibility.
    onSave({
      dietMode,
      vegGuests,
      nonVegGuests: dietMode === "veg-only" ? "0" : nonVegGuests,
      kidsCount,
      eventTime,
    });
  };

  if (!show) return null;

  const { minStr } = getMinEventDateTime();

  return (
    <div className="config-page" role="dialog" aria-modal="true" aria-label="Event configuration">
      <form className="config-modal config-page-form" onSubmit={onSubmit} onClick={(e) => e.stopPropagation()}>
        <header className="config-modal-header">
          <h3>Tell us about your event</h3>
          <p className="muted">This helps us recommend portions & menu better.</p>
        </header>

        <div className="config-field">
          <label>Diet Mode</label>
          <div className="diet-buttons" role="radiogroup" aria-label="Diet mode">
            <label className={`dietBtn ${dietMode === "veg-only" ? "active" : ""}`}>
              <input
                type="radio"
                name="diet"
                value="veg-only"
                checked={dietMode === "veg-only"}
                onChange={() => setDietMode("veg-only")}
                aria-checked={dietMode === "veg-only"}
              />
              Veg only
            </label>

            <label className={`dietBtn ${dietMode === "veg+nonveg" ? "active" : ""}`}>
              <input
                type="radio"
                name="diet"
                value="veg+nonveg"
                checked={dietMode === "veg+nonveg"}
                onChange={() => setDietMode("veg+nonveg")}
                aria-checked={dietMode === "veg+nonveg"}
              />
              Veg + Non-Veg
            </label>
          </div>
        </div>

        <div className="config-field twoCols">
          <label>Veg guests</label>
          <input
            type="number"
            min="0"
            value={vegGuests}
            onChange={(e) => setVegGuests(e.target.value)}
            aria-required="true"
          />
          {errors.vegGuests && <div className="errorText" role="alert">{errors.vegGuests}</div>}
        </div>
        <div className="config-field twoCols">
          <label>Non-veg guests</label>
          <input
            type="number"
            min="0"
            value={dietMode === "veg-only" ? "0" : nonVegGuests}
            onChange={(e) => setNonVegGuests(e.target.value)}
            disabled={dietMode === "veg-only"}
            aria-required={dietMode === "veg+nonveg"}
          />
          {errors.nonVegGuests && <div className="errorText" role="alert">{errors.nonVegGuests}</div>}
        </div>

        <div className="config-field twoCols">
          <label>How many kids?</label>
          <input
            type="number"
            min="0"
            value={kidsCount}
            onChange={(e) => setKidsCount(e.target.value)}
            aria-required="true"
          />
          {errors.kidsCount && <div className="errorText" role="alert">{errors.kidsCount}</div>}
        </div>

        {typeof guestsFromRoute === "number" ? (
          <p className="muted small">Veg + Non-Veg should total <strong>{guestsFromRoute}</strong>.</p>
        ) : (
          <p className="muted small">Veg + Non-Veg should total your expected guest count.</p>
        )}

        {errors.sum && (
          <div className="errorText" role="alert" style={{ marginTop: 8 }}>
            {errors.sum}
          </div>
        )}

        <div className="config-field">
          <label>Event time</label>
          {/* min restricts the datepicker to only allow selections on/after minStr (7 days ahead) */}
          <input
            type="datetime-local"
            value={eventTime}
            onChange={(e) => setEventTime(e.target.value)}
            className="input"
            aria-required="true"
            min={minStr}
          />
          {errors.eventTime && <div className="errorText" role="alert">{errors.eventTime}</div>}
          <p className="muted small" style={{ marginTop: 6 }}>
            Note: Event must be scheduled at least 7 days from now (earliest allowed: {minStr.split("T")[0]}).
          </p>
        </div>
        <div className="config-actions">
          <button type="submit" className="btn btn-primary">Save &amp; Continue</button>
        </div>
      </form>
    </div>
  );
};

export default ConfigModal;
