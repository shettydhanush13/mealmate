// src/pages/create-menu/components/ConfigModal.jsx
import React, { useState, useEffect, useCallback } from "react";
import { FaArrowRight, FaRegCalendarAlt } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./ConfigModal.scss";

/**
 * ConfigModal (full-page panel)
 *
 * - All fields required except kids (defaults to 0).
 * - veg + nonVeg must equal guestsFromRoute when provided; the two inputs are
 *   auto-linked so the total is always satisfied while typing.
 * - veg-only forces nonVeg = 0 and collapses the split.
 * - Event must be at least 7 days out (picker min and validation use the same instant).
 *
 * Props: show, initial, guestsFromRoute, onSave, onClose
 */

const pad = (n) => String(n).padStart(2, "0");

/** Earliest selectable event datetime: start of day, 7 days from now. */
const getMinEventDateTime = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 7);
  const minStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T00:00`;
  return { minDate: d, minStr };
};

const isPositiveInteger = (val) => {
  const n = Number(val);
  return Number.isInteger(n) && n >= 0;
};

const clampInt = (raw, min, max) =>
  Math.max(min, Math.min(max, Math.floor(Number(raw) || 0)));

/** Convert between a Date and the "YYYY-MM-DDTHH:MM" string the form persists. */
const dateToString = (date) =>
  date
    ? `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
    : "";

const stringToDate = (s) => {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
};

const ConfigModal = ({ show, initial = {}, guestsFromRoute = null, onSave, onClose }) => {
  const total = typeof guestsFromRoute === "number" ? guestsFromRoute : null;
  const isEditing = Boolean(initial?.eventTime);

  const [dietMode, setDietMode] = useState(initial.dietMode || "veg-only");
  const [vegGuests, setVegGuests] = useState(initial.vegGuests ?? "");
  const [nonVegGuests, setNonVegGuests] = useState(initial.nonVegGuests ?? "");
  const [kidsCount, setKidsCount] = useState(initial.kidsCount ?? "0");
  const [eventTime, setEventTime] = useState(initial.eventTime || "");
  const [errors, setErrors] = useState({});

  // Sync from `initial` whenever the panel opens.
  useEffect(() => {
    if (!show) return;
    setDietMode(initial.dietMode || "veg-only");
    setVegGuests(initial.vegGuests ?? "");
    setNonVegGuests(initial.nonVegGuests ?? "");
    setKidsCount(initial.kidsCount ?? "0");
    setEventTime(initial.eventTime || "");
    setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, initial]);

  // veg-only → non-veg is always 0, veg defaults to the full headcount.
  useEffect(() => {
    if (dietMode === "veg-only") {
      setNonVegGuests("0");
      if (total != null) setVegGuests(String(total));
    }
  }, [dietMode, total]);

  const clearErrors = useCallback((...keys) => {
    setErrors((prev) => {
      const next = { ...prev };
      keys.forEach((k) => delete next[k]);
      return next;
    });
  }, []);

  // Auto-linked guest split: editing one side fills the other to hit the total.
  const handleVeg = (raw) => {
    clearErrors("vegGuests", "sum");
    if (total != null && dietMode === "veg+nonveg" && raw !== "") {
      const v = clampInt(raw, 0, total);
      setVegGuests(String(v));
      setNonVegGuests(String(total - v));
    } else {
      setVegGuests(raw);
    }
  };

  const handleNonVeg = (raw) => {
    clearErrors("nonVegGuests", "sum");
    if (total != null && raw !== "") {
      const nv = clampInt(raw, 0, total);
      setNonVegGuests(String(nv));
      setVegGuests(String(total - nv));
    } else {
      setNonVegGuests(raw);
    }
  };

  const stepKids = (delta) => {
    clearErrors("kidsCount");
    setKidsCount((prev) => String(Math.max(0, (Number(prev) || 0) + delta)));
  };

  const validate = () => {
    const errs = {};

    if (vegGuests === "" || !isPositiveInteger(vegGuests)) {
      errs.vegGuests = "Enter a valid number of veg guests.";
    }
    if (dietMode === "veg+nonveg" && (nonVegGuests === "" || !isPositiveInteger(nonVegGuests))) {
      errs.nonVegGuests = "Enter a valid number of non-veg guests.";
    }
    if (kidsCount === "" || !isPositiveInteger(kidsCount)) {
      errs.kidsCount = "Enter a valid number of kids (0 if none).";
    }

    if (total != null) {
      const v = Number(vegGuests || 0);
      const nv = dietMode === "veg-only" ? 0 : Number(nonVegGuests || 0);
      if (v + nv !== total) {
        errs.sum = `Veg + Non-veg must equal ${total} guests (currently ${v + nv}).`;
      }
    }

    const { minDate, minStr } = getMinEventDateTime();
    if (!eventTime) {
      errs.eventTime = "Please select the event date & time.";
    } else {
      const dt = new Date(eventTime);
      if (Number.isNaN(dt.getTime())) {
        errs.eventTime = "Invalid date / time.";
      } else if (dt.getTime() < minDate.getTime()) {
        errs.eventTime = `Event must be on or after ${minStr.split("T")[0]} (at least 7 days from now).`;
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      dietMode,
      vegGuests,
      nonVegGuests: dietMode === "veg-only" ? "0" : nonVegGuests,
      kidsCount,
      eventTime,
    });
  };

  if (!show) return null;

  const { minDate, minStr } = getMinEventDateTime();

  // live allocation status (veg+nonveg with a known total)
  const assigned = (Number(vegGuests) || 0) + (dietMode === "veg-only" ? 0 : Number(nonVegGuests) || 0);
  const remaining = total != null ? total - assigned : 0;
  const allocState = remaining === 0 ? "is-ok" : remaining > 0 ? "is-under" : "is-over";

  return (
    <div className="config-page" role="dialog" aria-modal="true" aria-label="Event configuration">
      <form className="cfgCard" onSubmit={onSubmit} noValidate>
        <header className="cfgHead">
          <div className="cfgHead__icon" aria-hidden="true">🎉</div>
          <h3 className="cfgHead__title">Tell us about your event</h3>
          <p className="cfgHead__sub">This helps us recommend portions &amp; menu better.</p>
        </header>

        {/* Diet mode */}
        <div className="cfgField">
          <span className="cfgLabel">Diet preference</span>
          <div className="cfgSeg" role="radiogroup" aria-label="Diet mode">
            <button
              type="button"
              className={`cfgSeg__btn ${dietMode === "veg-only" ? "is-active" : ""}`}
              onClick={() => setDietMode("veg-only")}
              aria-pressed={dietMode === "veg-only"}
            >
              <span className="cfgDot cfgDot--veg" /> Veg only
            </button>
            <button
              type="button"
              className={`cfgSeg__btn ${dietMode === "veg+nonveg" ? "is-active" : ""}`}
              onClick={() => setDietMode("veg+nonveg")}
              aria-pressed={dietMode === "veg+nonveg"}
            >
              <span className="cfgDot cfgDot--nonveg" /> Veg + Non-veg
            </button>
          </div>
        </div>

        {/* Guest split */}
        {dietMode === "veg+nonveg" ? (
          <div className="cfgField">
            <span className="cfgLabel">Guest split</span>
            <div className="cfgSplit">
              <div className="cfgNum">
                <label className="cfgNum__tag" htmlFor="vegGuests">
                  <span className="cfgDot cfgDot--veg" /> Veg
                </label>
                <input
                  id="vegGuests"
                  className="cfgInput"
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={vegGuests}
                  onChange={(e) => handleVeg(e.target.value)}
                  aria-invalid={Boolean(errors.vegGuests || errors.sum)}
                />
              </div>
              <div className="cfgNum">
                <label className="cfgNum__tag" htmlFor="nonVegGuests">
                  <span className="cfgDot cfgDot--nonveg" /> Non-veg
                </label>
                <input
                  id="nonVegGuests"
                  className="cfgInput"
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={nonVegGuests}
                  onChange={(e) => handleNonVeg(e.target.value)}
                  aria-invalid={Boolean(errors.nonVegGuests || errors.sum)}
                />
              </div>
            </div>

            {total != null && (
              <div className={`cfgAlloc ${allocState}`}>
                <div className="cfgAlloc__bar">
                  <div
                    className="cfgAlloc__fill"
                    style={{ width: `${Math.min(100, total ? (assigned / total) * 100 : 0)}%` }}
                  />
                </div>
                <div className="cfgAlloc__text">
                  <span>{assigned} of {total} guests assigned</span>
                  <span className="cfgAlloc__status">
                    {remaining === 0 ? "Perfect ✓" : remaining > 0 ? `${remaining} left` : `${-remaining} over`}
                  </span>
                </div>
              </div>
            )}

            {(errors.vegGuests || errors.nonVegGuests || errors.sum) && (
              <div className="cfgError" role="alert">
                {errors.vegGuests || errors.nonVegGuests || errors.sum}
              </div>
            )}
          </div>
        ) : total != null ? (
          <div className="cfgField">
            <div className="cfgVegOnly">
              <span className="cfgDot cfgDot--veg" />
              All <strong>{total}</strong> guests · Pure veg menu
            </div>
          </div>
        ) : (
          <div className="cfgField">
            <label className="cfgLabel" htmlFor="vegGuests">Number of veg guests</label>
            <input
              id="vegGuests"
              className="cfgInput"
              type="number"
              min="0"
              inputMode="numeric"
              value={vegGuests}
              onChange={(e) => handleVeg(e.target.value)}
              aria-invalid={Boolean(errors.vegGuests)}
            />
            {errors.vegGuests && <div className="cfgError" role="alert">{errors.vegGuests}</div>}
          </div>
        )}

        {/* Kids */}
        <div className="cfgField">
          <span className="cfgLabel">
            How many kids? <span className="cfgOptional">optional</span>
          </span>
          <div className="cfgStepper">
            <button type="button" className="cfgStepBtn" onClick={() => stepKids(-1)} aria-label="Fewer kids" disabled={(Number(kidsCount) || 0) <= 0}>−</button>
            <input
              className="cfgInput cfgInput--center"
              type="number"
              min="0"
              inputMode="numeric"
              value={kidsCount}
              onChange={(e) => { clearErrors("kidsCount"); setKidsCount(e.target.value); }}
              aria-label="Number of kids"
            />
            <button type="button" className="cfgStepBtn" onClick={() => stepKids(1)} aria-label="More kids">+</button>
          </div>
          {errors.kidsCount && <div className="cfgError" role="alert">{errors.kidsCount}</div>}
        </div>

        {/* Event time */}
        <div className="cfgField">
          <label className="cfgLabel" htmlFor="eventTime">Event date &amp; time</label>
          <div className={`cfgDate ${errors.eventTime ? "is-invalid" : ""}`}>
            <FaRegCalendarAlt className="cfgDate__icon" aria-hidden="true" />
            <DatePicker
              id="eventTime"
              selected={stringToDate(eventTime)}
              onChange={(date) => { clearErrors("eventTime"); setEventTime(dateToString(date)); }}
              showTimeSelect
              timeIntervals={30}
              timeCaption="Time"
              minDate={minDate}
              dateFormat="EEE, dd MMM yyyy · h:mm aa"
              placeholderText="Select date & time"
              className="cfgDate__input"
              wrapperClassName="cfgDate__wrap"
              calendarClassName="cfgCal"
              popperClassName="cfgPopper"
              shouldCloseOnSelect={false}
            />
          </div>
          {errors.eventTime ? (
            <div className="cfgError" role="alert">{errors.eventTime}</div>
          ) : (
            <p className="cfgHint">Earliest date: {minStr.split("T")[0]} · book at least 7 days ahead.</p>
          )}
        </div>

        <div className="cfgActions">
          {isEditing && (
            <button type="button" className="cfgBtn cfgBtn--ghost" onClick={onClose}>
              Cancel
            </button>
          )}
          <button type="submit" className="cfgBtn cfgBtn--primary">
            Save &amp; Continue <FaArrowRight />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConfigModal;
