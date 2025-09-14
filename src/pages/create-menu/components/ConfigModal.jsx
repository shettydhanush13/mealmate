// src/pages/create-menu/components/ConfigModal.jsx
import React, { useState, useEffect } from "react";

const ConfigModal = ({ show, initial = {}, guestsFromRoute = null, onClose, onSave, availableCuisines = [] }) => {
  const [dietMode, setDietMode] = useState(initial.dietMode || "veg+nonveg");
  const [vegGuests, setVegGuests] = useState(initial.vegGuests ?? "");
  const [nonVegGuests, setNonVegGuests] = useState(initial.nonVegGuests ?? "");
  const [kidsCount, setKidsCount] = useState(initial.kidsCount ?? "");
  const [cuisinePrefs, setCuisinePrefs] = useState(initial.cuisinePrefs || []);
  const [eventTime, setEventTime] = useState(initial.eventTime || "");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // sync incoming initial when modal toggled open
    if (show) {
      setDietMode(initial.dietMode || "veg+nonveg");
      setVegGuests(initial.vegGuests ?? "");
      setNonVegGuests(initial.nonVegGuests ?? "");
      setKidsCount(initial.kidsCount ?? "");
      setCuisinePrefs(initial.cuisinePrefs || []);
      setEventTime(initial.eventTime || "");
      setErrors({});
    }
  }, [show, initial]);

  const isPositiveIntegerOrEmpty = (val) => {
    if (val === "" || val === null || val === undefined) return true;
    const n = Number(val);
    return Number.isInteger(n) && n >= 0;
  };

  const validate = () => {
    const errs = {};
    if (!isPositiveIntegerOrEmpty(vegGuests) || vegGuests === "") errs.vegGuests = "Enter number of veg guests";
    if (dietMode === "veg+nonveg") {
      if (!isPositiveIntegerOrEmpty(nonVegGuests) || nonVegGuests === "") errs.nonVegGuests = "Enter number of non-veg guests";
    }
    if (!isPositiveIntegerOrEmpty(kidsCount) || kidsCount === "") errs.kidsCount = "Enter number of kids (0 if none)";
    if (eventTime) {
      const dt = new Date(eventTime);
      if (isNaN(dt.getTime())) errs.eventTime = "Invalid date/time";
      else if (dt < new Date()) errs.eventTime = "Please choose a future date/time";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const toggleCuisine = (c) => {
    setCuisinePrefs(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      dietMode, vegGuests, nonVegGuests, kidsCount, cuisinePrefs, eventTime,
    });
  };

  if (!show) return null;
  return (
    <div className="config-modal-backdrop" role="dialog" aria-modal="true" aria-label="Event configuration">
      <form className="config-modal" onSubmit={onSubmit} onClick={(e) => e.stopPropagation()}>
        <header className="config-modal-header">
          <h3>Tell us about your event</h3>
          <p className="muted">This helps us recommend portions & menu better.</p>
        </header>

        <div className="config-field">
          <label>Diet Mode</label>
          <div className="diet-buttons">
            <label className={`dietBtn ${dietMode === "veg-only" ? "active" : ""}`}>
              <input type="radio" name="diet" value="veg-only" checked={dietMode === "veg-only"} onChange={() => setDietMode("veg-only")} />
              Veg only
            </label>
            <label className={`dietBtn ${dietMode === "veg+nonveg" ? "active" : ""}`}>
              <input type="radio" name="diet" value="veg+nonveg" checked={dietMode === "veg+nonveg"} onChange={() => setDietMode("veg+nonveg")} />
              Veg + Non-Veg
            </label>
          </div>
        </div>

        <div className="config-field twoCols">
          <label>Veg guests</label>
          <input type="number" min="0" value={vegGuests} onChange={(e) => setVegGuests(e.target.value)} />
          {errors.vegGuests && <div className="errorText">{errors.vegGuests}</div>}
        </div>

        <div className="config-field twoCols">
          <label>Non-veg guests</label>
          <input type="number" min="0" value={dietMode === "veg-only" ? 0 : nonVegGuests} onChange={(e) => setNonVegGuests(e.target.value)} disabled={dietMode === "veg-only"} />
          {errors.nonVegGuests && <div className="errorText">{errors.nonVegGuests}</div>}
        </div>

        <div className="config-field twoCols">
          <label>How many kids?</label>
          <input type="number" min="0" value={kidsCount} onChange={(e) => setKidsCount(e.target.value)} />
          {errors.kidsCount && <div className="errorText">{errors.kidsCount}</div>}
        </div>

        {guestsFromRoute ? (
          <p className="muted small">Tip: guests total (veg + non-veg + kids) ideally should match the party guest count ({guestsFromRoute}).</p>
        ) : null}

        <br />

        <div className="config-field">
          <label>Cuisine preferences</label>
          <div className="cuisine-chips">
            {availableCuisines.map((c) => (
              <button
                type="button"
                key={c}
                className={`cuisine-chip ${cuisinePrefs.includes(c) ? "active" : ""}`}
                onClick={() => toggleCuisine(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <br />

        <div className="config-field">
          <label>Event time</label>
          <input type="datetime-local" value={eventTime} onChange={(e) => setEventTime(e.target.value)} className="input" />
          {errors.eventTime && <div className="errorText">{errors.eventTime}</div>}
        </div>

        <div className="config-actions">
          <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary">Save & Continue</button>
        </div>
      </form>
    </div>
  );
};

export default ConfigModal;
