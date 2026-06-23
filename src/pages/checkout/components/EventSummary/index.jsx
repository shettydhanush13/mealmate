// src/pages/checkout/components/EventSummary/index.jsx
import React, { useMemo } from "react";
import PropTypes from "prop-types";
import "./styles.scss";

/**
 * EventSummary — checkout summary of the event.
 *
 * Props:
 * - eventType, date (ISO), guests, vegGuests, nonVegGuests, dietMode, mealType
 */
const EventSummary = ({
  eventType = null,
  date = null,
  guests = null,
  vegGuests = null,
  nonVegGuests = null,
  dietMode = "veg+nonveg",
  mealType = null,
  packaging = null,
}) => {
  const isCaterBox = String(mealType).toLowerCase() === "caterbox";
  const formatDateTime = (dtStr) => {
    if (!dtStr) return "Not set";
    const dt = new Date(dtStr);
    if (isNaN(dt.getTime())) return "Invalid date";
    return dt.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const mealTypeDisplay = useMemo(() => {
    if (!mealType) return null;
    const key = String(mealType).toLowerCase();
    if (key === "buffet") return { label: "Buffet (with service staff)", emoji: "🍽️" };
    if (key === "caterbox" || key === "cater box") return { label: "CaterBox (boxed catering)", emoji: "🍱" };
    return { label: String(mealType), emoji: "🍱" };
  }, [mealType]);

  const safeNumber = (v) => {
    if (v === null || v === undefined || v === "") return "-";
    const n = Number(v);
    return Number.isFinite(n) ? n : v;
  };

  // Only show the Total / Veg / Non-veg tile grid when there's a real split;
  // otherwise guests read as a single clean row (pure-veg is the default today).
  const showSplit = dietMode === "veg+nonveg";

  return (
    <aside className="esCard" aria-label="Event summary" role="region">
      <header className="esCard__head">
        <span className="esCard__icon" aria-hidden="true">🗓️</span>
        <h3 className="esCard__title">Event Summary</h3>
      </header>

      <div className="esCard__rows">
        {isCaterBox ? (
          packaging && (
            <div className="esRow">
              <span className="esRow__icon" aria-hidden="true">📦</span>
              <span className="esRow__label">Packaging</span>
              <span className="esRow__value">{packaging}</span>
            </div>
          )
        ) : (
          eventType && (
            <div className="esRow">
              <span className="esRow__icon" aria-hidden="true">🎉</span>
              <span className="esRow__label">Event type</span>
              <span className="esRow__value">{eventType}</span>
            </div>
          )
        )}

        {date && (
          <div className="esRow">
            <span className="esRow__icon" aria-hidden="true">📅</span>
            <span className="esRow__label">Date &amp; time</span>
            <span className="esRow__value">{formatDateTime(date)}</span>
          </div>
        )}

        {mealTypeDisplay && (
          <div className="esRow">
            <span className="esRow__icon" aria-hidden="true">{mealTypeDisplay.emoji}</span>
            <span className="esRow__label">Meal type</span>
            <span className="esRow__value">{mealTypeDisplay.label}</span>
          </div>
        )}

        {/* Pure-veg (default today): guests read as a single clean row. */}
        {!showSplit && guests != null && guests !== "" && (
          <div className="esRow">
            <span className="esRow__icon" aria-hidden="true">👥</span>
            <span className="esRow__label">Guests</span>
            <span className="esRow__value">{safeNumber(guests)}</span>
          </div>
        )}
      </div>

      {/* Veg / Non-veg breakdown — only when a split was actually chosen. */}
      {showSplit && (
        <div className="esStats">
          <div className="esStat esStat--total">
            <span className="esStat__value">{safeNumber(guests)}</span>
            <span className="esStat__label">Total guests</span>
          </div>
          <div className="esStat esStat--veg">
            <span className="esStat__value">{safeNumber(vegGuests)}</span>
            <span className="esStat__label">Veg</span>
          </div>
          <div className="esStat esStat--nonveg">
            <span className="esStat__value">{safeNumber(nonVegGuests)}</span>
            <span className="esStat__label">Non-veg</span>
          </div>
        </div>
      )}
    </aside>
  );
};

EventSummary.propTypes = {
  eventType: PropTypes.string,
  date: PropTypes.string,
  guests: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  vegGuests: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  nonVegGuests: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  dietMode: PropTypes.string,
  mealType: PropTypes.string,
  packaging: PropTypes.string,
};

export default EventSummary;
