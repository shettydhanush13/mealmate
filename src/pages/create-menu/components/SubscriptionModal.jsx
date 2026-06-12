// src/pages/create-menu/components/SubscriptionModal.jsx
import React, { useEffect, useState } from "react";
import { FaTimes, FaRegCalendarAlt, FaTags } from "react-icons/fa";
import "./SubscriptionModal.scss";

// Bulk-discount tiers (informational only — pricing is not wired up yet).
const TIERS = [
  { min: 60, pct: 15 },
  { min: 30, pct: 10 },
  { min: 12, pct: 5 },
  { min: 0, pct: 0 },
];

export const discountFor = (totalMeals) => {
  const n = Number(totalMeals) || 0;
  return (TIERS.find((t) => n >= t.min) || { pct: 0 }).pct;
};

const FREQUENCIES = [
  { id: "daily", label: "Daily" },
  { id: "weekdays", label: "Weekdays" },
  { id: "weekly", label: "Weekly" },
  { id: "custom", label: "Custom" },
];

/**
 * SubscriptionModal — lets a customer sketch out a recurring CaterBox plan
 * (fixed food, long-term, for a set number of meals, with bulk discounts).
 *
 * NOTE: this captures intent only — it does NOT affect the current order,
 * pricing, or checkout yet. It's an early "configure it" entry point.
 *
 * Props: show, initial, mealSlot, boxType, onClose, onSave
 */
const SubscriptionModal = ({ show, initial = null, mealSlot, boxType, onClose, onSave }) => {
  const [frequency, setFrequency] = useState("weekly");
  const [totalMeals, setTotalMeals] = useState("");
  const [mealsPerDelivery, setMealsPerDelivery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!show) return;
    setFrequency(initial?.frequency || "weekly");
    setTotalMeals(initial?.totalMeals ?? "");
    setMealsPerDelivery(initial?.mealsPerDelivery ?? "");
    setStartDate(initial?.startDate || "");
    setNotes(initial?.notes || "");
  }, [show, initial]);

  if (!show) return null;

  const pct = discountFor(totalMeals);

  const submit = (e) => {
    e.preventDefault();
    onSave?.({ frequency, totalMeals, mealsPerDelivery, startDate, notes, discountPct: pct });
  };

  return (
    <div className="subOverlay" role="dialog" aria-modal="true" aria-label="Configure subscription">
      <form className="subModal" onSubmit={submit}>
        <header className="subModal__head">
          <div className="subModal__icon" aria-hidden="true">🗓️</div>
          <div className="subModal__heading">
            <h3 className="subModal__title">
              CaterBox Subscription <span className="subModal__badge">Coming soon</span>
            </h3>
            <p className="subModal__sub">
              Order the same box on a regular schedule for a fixed number of meals — and save with bulk pricing.
            </p>
          </div>
          <button type="button" className="subModal__close" onClick={onClose} aria-label="Close">
            <FaTimes />
          </button>
        </header>

        {(mealSlot || boxType) && (
          <div className="subModal__context">
            {mealSlot && <span className="subChip">{mealSlot}</span>}
            {boxType && <span className="subChip">{boxType}-item box</span>}
          </div>
        )}

        <div className="subModal__body">
          {/* Frequency */}
          <div className="subField">
            <span className="subField__label">Delivery frequency</span>
            <div className="subFreq" role="radiogroup" aria-label="Frequency">
              {FREQUENCIES.map((f) => (
                <button
                  type="button"
                  key={f.id}
                  className={`subFreq__btn ${frequency === f.id ? "is-active" : ""}`}
                  onClick={() => setFrequency(f.id)}
                  aria-pressed={frequency === f.id}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="subGrid">
            <div className="subField">
              <label className="subField__label" htmlFor="subTotal">Total meals</label>
              <input
                id="subTotal"
                className="subInput"
                type="number"
                min="1"
                inputMode="numeric"
                placeholder="e.g. 30"
                value={totalMeals}
                onChange={(e) => setTotalMeals(e.target.value)}
              />
              <span className="subField__hint">Across the whole plan</span>
            </div>

            <div className="subField">
              <label className="subField__label" htmlFor="subPer">Boxes per delivery</label>
              <input
                id="subPer"
                className="subInput"
                type="number"
                min="1"
                inputMode="numeric"
                placeholder="e.g. 10"
                value={mealsPerDelivery}
                onChange={(e) => setMealsPerDelivery(e.target.value)}
              />
              <span className="subField__hint">How many each time</span>
            </div>
          </div>

          <div className="subField">
            <label className="subField__label" htmlFor="subStart">Start date</label>
            <div className="subDate">
              <FaRegCalendarAlt className="subDate__icon" aria-hidden="true" />
              <input
                id="subStart"
                className="subInput subInput--date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
          </div>

          {/* Discount preview (informational) */}
          <div className={`subDiscount ${pct > 0 ? "is-on" : ""}`}>
            <FaTags className="subDiscount__icon" aria-hidden="true" />
            <div className="subDiscount__text">
              {pct > 0 ? (
                <>Your plan qualifies for an estimated <strong>{pct}% bulk discount</strong>.</>
              ) : (
                <>Order <strong>12+ meals</strong> to unlock bulk discounts (up to 15% off).</>
              )}
              <div className="subDiscount__tiers">12+ → 5% · 30+ → 10% · 60+ → 15%</div>
            </div>
          </div>

          <div className="subField">
            <label className="subField__label" htmlFor="subNotes">Anything else? (optional)</label>
            <textarea
              id="subNotes"
              className="subInput subInput--area"
              rows={2}
              placeholder="Preferences, delivery window, dietary notes…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <p className="subModal__note">
            This is a preview — submitting won't place a recurring order yet. Our team will reach out to finalise your plan and pricing.
          </p>
        </div>

        <div className="subModal__actions">
          <button type="button" className="subBtn subBtn--ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="subBtn subBtn--primary">Register interest</button>
        </div>
      </form>
    </div>
  );
};

export default SubscriptionModal;
